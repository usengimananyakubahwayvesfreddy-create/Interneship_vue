<template>
  <div class="game-container">
    <!-- Score Dashboard -->
    <div class="score-board-wrapper">
      <div class="score-board">Score: {{ localScore }}</div>
      <div class="speed-board">Difficulty: Lv. {{ difficultyLevel }}</div>
    </div>

    <!-- Manual Settings Dashboard -->
    <div class="settings-panel" v-if="!localGameOver">
      <label>Set Difficulty manually: </label>
      <select :value="difficultyLevel" @change="onDifficultySelect">
        <option :value="1">Level 1 (Slow)</option>
        <option :value="2">Level 2 (Normal)</option>
        <option :value="3">Level 3 (Fast)</option>
        <option :value="4">Level 4 (Insane)</option>
      </select>
    </div>

    <!-- Game Arena Area -->
    <div class="arena">
      <div 
        class="player" 
        :style="{ bottom: playerY + 'px', left: playerX + 'px' }"
      ></div>
      
      <div 
        class="obstacle" 
        :style="{ left: obstacleX + 'px', bottom: '0px' }"
      ></div>

      <!-- Game Over Screen -->
      <div v-if="localGameOver" class="game-over-screen">
        <h2>Game Over</h2>
        <p>Final Score: {{ localScore }}</p>
        <p v-if="isSavingScore" class="saving-text">Saving score to server...</p>
        <button v-else @click="handleRestart">Try Again</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
// Import the game service
import gameService from '../services/gameService';

import jumpSound from '../assets/sounds/jump.mp3';
import scoreSound from '../assets/sounds/score.mp3';
import bgMusic from '../assets/sounds/music.mp3';

export default {
  name: 'JumpGame',
  data() {
    return {
      localScore: 0,
      localGameOver: false,
      isSavingScore: false, // UI loader flag during Axios POST execution
      
      arenaWidth: 600,
      playerX: 50,
      playerY: 0,
      playerWidth: 40,
      playerHeight: 50,
      
      obstacleX: 650,
      obstacleWidth: 30,
      obstacleHeight: 40,
      
      velocityY: 0,
      gravity: 0.6,
      jumpForce: 12,
      isJumping: false,
      
      animationFrameId: null,
      obstaclePassed: false,
      bgAudioInstance: null
    };
  },
  computed: {
    ...mapGetters(['currentScore', 'difficultyLevel', 'gameOver']),
    obstacleSpeed() {
      const baseMovementSpeed = 4;
      return baseMovementSpeed + (this.difficultyLevel * 2);
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
    this.playMusic();
    this.startGame();
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.bgAudioInstance) this.bgAudioInstance.pause();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  },
  methods: {
    ...mapActions(['addScore', 'changeDifficulty', 'setGameOver', 'resetGame']),

    playSound(soundName) {
      let audioSource = soundName === 'jump' ? jumpSound : scoreSound;
      const fx = new Audio(audioSource);
      fx.currentTime = 0;
      fx.play().catch(() => {});
    },
    playMusic() {
      this.bgAudioInstance = new Audio(bgMusic);
      this.bgAudioInstance.loop = true;
      this.bgAudioInstance.volume = 0.4;
      this.bgAudioInstance.play().catch(() => {});
    },
    startGame() {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.gameLoop();
    },
    gameLoop() {
      if (this.localGameOver) return;

      this.obstacleX -= this.obstacleSpeed;

      if (this.isJumping) {
        this.velocityY -= this.gravity;
        this.playerY += this.velocityY;
        if (this.playerY <= 0) {
          this.playerY = 0;
          this.velocityY = 0;
          this.isJumping = false;
        }
      }

      const hasCollision = 
        this.playerX < this.obstacleX + this.obstacleWidth &&
        this.playerX + this.playerWidth > this.obstacleX &&
        this.playerY < this.obstacleHeight;

      if (hasCollision) {
        this.triggerGameOver();
        return; 
      }

      if (!this.obstaclePassed && this.obstacleX < this.playerX) {
        this.incrementScore();
        this.obstaclePassed = true; 
      }

      if (this.obstacleX < -this.obstacleWidth) {
        this.obstacleX = this.arenaWidth + Math.floor(Math.random() * 100);
        this.obstaclePassed = false; 
      }

      if (!this.localGameOver) {
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
      }
    },
    // Extracted out collision ending parameters into an async sequence handler
    async triggerGameOver() {
      this.localGameOver = true;
      this.setGameOver(true);
      if (this.bgAudioInstance) this.bgAudioInstance.pause();
      
      // Prompt player for assignment requirements check execution 
      const playerName = prompt("Game Over! Enter your name to submit your score:");
      if (playerName) {
        this.isSavingScore = true;
        try {
          await gameService.submitHighScore(playerName, this.localScore);
        } catch (err) {
          alert("Failed to sync score to backend server.");
        } finally {
          this.isSavingScore = false;
        }
      }
    },
    handleKeyDown(event) {
      if (event.code === 'Space') {
        event.preventDefault();
        if (this.bgAudioInstance && this.bgAudioInstance.paused && !this.localGameOver) {
          this.bgAudioInstance.play().catch(() => {});
        }
        this.jump();
      }
    },
    jump() {
      if (this.isJumping || this.localGameOver) return;
      this.isJumping = true;
      this.velocityY = this.jumpForce;
      this.playSound('jump');
    },
    incrementScore() {
      this.localScore += 1;
      this.addScore(); 
      this.playSound('score');

      if (this.localScore > 0 && this.localScore % 5 === 0) {
        const nextLevelTier = this.difficultyLevel + 1;
        this.changeDifficulty(nextLevelTier);
      }
    },
    onDifficultySelect(event) {
      const selectedValue = parseInt(event.target.value);
      this.changeDifficulty(selectedValue);
    },
    handleRestart() {
      this.localScore = 0; 
      this.localGameOver = false;
      this.resetGame(); 
      this.obstacleX = 650;
      this.playerY = 0;
      this.velocityY = 0;
      this.obstaclePassed = false;
      this.isJumping = false;
      if (this.bgAudioInstance) {
        this.bgAudioInstance.currentTime = 0;
        this.bgAudioInstance.play().catch(() => {});
      }
      this.startGame();
    }
  }
};
</script>

<style scoped>
.game-container { position: relative; width: 600px; margin: 20px auto; font-family: Arial, sans-serif; }
.score-board-wrapper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.score-board, .speed-board { font-size: 20px; font-weight: bold; }
.speed-board { color: #e74c3c; }
.settings-panel { background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd; margin-bottom: 15px; border-radius: 4px; font-size: 14px; }
select { padding: 4px 8px; font-family: inherit; }
.arena { position: relative; width: 600px; height: 200px; background-color: #f0f0f0; border: 2px solid #333; overflow: hidden; }
.player { position: absolute; width: 40px; height: 50px; background-color: #3498db; }
.obstacle { position: absolute; width: 30px; height: 40px; background-color: #e74c3c; }
.game-over-screen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10; }
.saving-text { color: #f1c40f; font-style: italic; }
button { padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #2ecc71; border: none; color: white; border-radius: 5px; }
</style>
