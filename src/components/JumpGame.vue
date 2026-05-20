<template>
  <div class="game-container">
    <!-- Score Display mapped from Vuex -->
    <div class="score-board">Score: {{ score }}</div>

    <!-- Game Over Screen reading from Vuex -->
    <div v-if="gameOver" class="game-over-screen">
      <h2>Game Over</h2>
      <p>Final Score: {{ score }}</p>
      <button @click="resetGame">Try Again</button>
    </div>

    <!-- Game Arena -->
    <div class="arena">
      <!-- Player Element -->
      <div ref="playerRef" :class="['player', { 'is-jumping': isJumping }]"></div>

      <!-- Obstacle Element -->
      <div 
        ref="obstacleRef" 
        class="obstacle" 
        :style="{ left: obstaclePosition.x + 'px' }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JumpGame',
  data() {
    return {
      obstaclePosition: {
        x: 500
      },
      isJumping: false,
      animationFrameId: null,
      obstaclePassed: false,
      bgAudio: null,
      jumpAudio: null,
      gameOverAudio: null
    };
  },
  computed: {
    // Read state parameters directly out of the shared Vuex instance
    score() {
      return this.$store.state.score;
    },
    gameOver() {
      return this.$store.state.gameOver;
    }
  },
  mounted() {
    this.initAudio();
    this.startGame();
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.stopAllAudio();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },
  methods: {
    initAudio() {
      this.bgAudio = new Audio('/background.mp3');
      this.jumpAudio = new Audio('/jump.mp3');
      this.gameOverAudio = new Audio('/sound.mp3');
      this.bgAudio.loop = true;
      this.bgAudio.volume = 0.4;
    },
    stopAllAudio() {
      if (this.bgAudio) {
        this.bgAudio.pause();
        this.bgAudio.currentTime = 0;
      }
      if (this.jumpAudio) {
        this.jumpAudio.pause();
        this.jumpAudio.currentTime = 0;
      }
      if (this.gameOverAudio) {
        this.gameOverAudio.pause();
        this.gameOverAudio.currentTime = 0;
      }
    },
    startGame() {
      this.bgAudio.play().catch(() => {
        console.log("Audio waiting for interaction");
      });
      this.gameLoop();
    },
    gameLoop() {
      if (this.gameOver) return;

      this.obstaclePosition.x -= 5;

      if (this.obstaclePosition.x < -40) {
        this.obstaclePosition.x = 600;
        this.obstaclePassed = false;
      }

      this.checkScore();
      this.checkCollision();

      if (!this.gameOver) {
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
      }
    },
    handleKeyDown(event) {
      if (event.code === 'Space') {
        event.preventDefault();
        if (this.bgAudio && this.bgAudio.paused && !this.gameOver) {
          this.bgAudio.play().catch(() => {});
        }
        this.jump();
      }
    },
    jump() {
      if (this.isJumping || this.gameOver) return;
      
      this.isJumping = true;
      if (this.jumpAudio) {
        this.jumpAudio.currentTime = 0;
        this.jumpAudio.play().catch(() => {});
      }
      setTimeout(() => {
        this.isJumping = false;
      }, 500);
    },
    checkCollision() {
      const player = this.$refs.playerRef;
      const obstacle = this.$refs.obstacleRef;

      if (!player || !obstacle) return;

      const pRect = player.getBoundingClientRect();
      const oRect = obstacle.getBoundingClientRect();

      const standardCollision = 
        pRect.right > oRect.left &&
        pRect.left < oRect.right &&
        pRect.bottom > oRect.top &&
        pRect.top < oRect.bottom;

      if (standardCollision) {
        // Dispatch action to Vuex to change state global tracking
        this.$store.dispatch('setGameOver', true);
        cancelAnimationFrame(this.animationFrameId);

        if (this.bgAudio) this.bgAudio.pause();
        if (this.gameOverAudio) {
          this.gameOverAudio.currentTime = 0;
          this.gameOverAudio.play().catch(() => {});
        }
      }
    },
    checkScore() {
      if (!this.obstaclePassed && this.obstaclePosition.x < 50) {
        this.incrementScore();
        this.obstaclePassed = true;
      }
    },
    incrementScore() {
      // Dispatch score addition payload out to Vuex ecosystem
      this.$store.dispatch('incrementScore');
    },
    resetGame() {
      this.stopAllAudio();
      // Dispatch system reset parameters down into Vuex
      this.$store.dispatch('resetGame');
      this.obstaclePosition.x = 500;
      this.obstaclePassed = false;
      this.isJumping = false;
      this.startGame();
    }
  }
};
</script>

<style scoped>
.game-container {
  position: relative;
  width: 600px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
}

.score-board {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.arena {
  position: relative;
  width: 600px;
  height: 200px;
  background-color: #f0f0f0;
  border: 2px solid #333;
  overflow: hidden;
}

.player {
  position: absolute;
  left: 50px;
  bottom: 0;
  width: 40px;
  height: 50px;
  background-color: #3498db;
  transition: bottom 0.25s ease-out;
}

.player.is-jumping {
  bottom: 100px;
  transition: bottom 0.25s ease-in;
}

.obstacle {
  position: absolute;
  bottom: 0;
  width: 30px;
  height: 40px;
  background-color: #e74c3c;
}

.game-over-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #2ecc71;
  border: none;
  color: white;
  border-radius: 5px;
}
</style>
