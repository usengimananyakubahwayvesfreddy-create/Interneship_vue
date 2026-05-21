<template>
  <div class="leaderboard-container">
    <h3>🏆 Global High Scores (Axios Fetch)</h3>
    
    <div v-if="loading" class="status-message">Loading scoreboard profiles...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>
    
    <ul v-else class="score-list">
      <li v-for="(player, index) in highScores" :key="player.id" class="score-item">
        <span class="rank">#{{ index + 1 }}</span>
        <span class="name">{{ player.name }}</span>
        <span class="score">{{ player.score }} pts</span>
      </li>
    </ul>
    
    <button @click="loadScores" class="refresh-btn">Refresh Leaderboard</button>
  </div>
</template>

<script>
import gameService from '../services/gameService';

export default {
  name: 'GameLeaderboard', // FIX: Multi-word component name satisfies ESLint rules
  data() {
    return {
      highScores: [],
      loading: true,
      error: null
    };
  },
  mounted() {
    this.loadScores();
  },
  methods: {
    async loadScores() {
      this.loading = true;
      this.error = null;
      try {
        this.highScores = await gameService.fetchHighScores();
      } catch (err) {
        this.error = 'Failed to fetch high scores from the backend server.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.leaderboard-container {
  width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
h3 { margin-top: 0; color: #2c3e50; text-align: center; }
.status-message { text-align: center; padding: 15px; color: #7f8c8d; }
.status-message.error { color: #e74c3c; font-weight: bold; }
.score-list { list-style: none; padding: 0; margin: 15px 0; }
.score-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.score-item:last-child { border-bottom: none; }
.rank { font-weight: bold; color: #f1c40f; width: 40px; }
.name { flex-grow: 1; color: #34495e; }
.score { font-weight: bold; color: #2ecc71; }
.refresh-btn {
  display: block;
  width: 100%;
  padding: 8px;
  background-color: #34495e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.refresh-btn:hover { background-color: #2c3e50; }
</style>
