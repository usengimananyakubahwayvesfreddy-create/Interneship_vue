<template>
  <div class="game-container">
    <!-- Score Display -->
    <div class="score-board">Score: {{ score }}</div>

    <!-- Game Over Screen -->
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
      score: 0,
      gameOver: false,
      obstaclePosition: {
        x: 500
      },
      isJumping: false,
      animationFrameId: null,
      obstaclePassed: false
    };
  },
  mounted() {
    this.startGame();
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    // Vue 3 Lifecycle Hook clean-up
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },
  methods: {
    startGame() {
      this.gameLoop();
    },
    gameLoop() {
      if (this.gameOver) return;

      // Move obstacle left
      this.obstaclePosition.x -= 5;

      // Reset obstacle when it goes completely off-screen
      if (this.obstaclePosition.x < -40) {
        this.obstaclePosition.x = 600;
        this.obstaclePassed = false; // Allow scoring on next pass
      }

      // Check conditions
      this.checkScore();
      this.checkCollision();

      // Continue loop if game is active
      if (!this.gameOver) {
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
      }
    },
    handleKeyDown(event) {
      if (event.code === 'Space') {
        event.preventDefault(); // Stop webpage scrolling
        this.jump();
      }
    },
    jump() {
      if (this.isJumping || this.gameOver) return;
      
      this.isJumping = true;
      // Handles jump time length (500ms match CSS transition)
      setTimeout(() => {
        this.isJumping = false;
      }, 500);
    },
    checkCollision() {
      const player = this.$refs.playerRef;
      const obstacle = this.$refs.obstacleRef;

      if (!player || !obstacle) return;

      // Real-time boundary calculation matching screen coordinates
      const pRect = player.getBoundingClientRect();
      const oRect = obstacle.getBoundingClientRect();

      const standardCollision = 
        pRect.right > oRect.left &&
        pRect.left < oRect.right &&
        pRect.bottom > oRect.top &&
        pRect.top < oRect.bottom;

      if (standardCollision) {
        this.gameOver = true;
        cancelAnimationFrame(this.animationFrameId);
      }
    },
    checkScore() {
      // Safely check if the obstacle passed the player's position (x: 50)
      if (!this.obstaclePassed && this.obstaclePosition.x < 50) {
        this.incrementScore();
        this.obstaclePassed = true;
      }
    },
    incrementScore() {
      this.score += 1;
    },
    resetGame() {
      this.score = 0;
      this.gameOver = false;
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
  transition: bottom 0.25s ease-out; /* Smooth rising action */
}

.player.is-jumping {
  bottom: 100px; /* Jump ceiling height */
  transition: bottom 0.25s ease-in; /* Smooth falling action */
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
