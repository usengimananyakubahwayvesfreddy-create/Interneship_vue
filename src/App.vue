<template>
  <div id="app">
    <header class="app-header">
      <h1>Vue 3 Jump Game Canvas Arena</h1>
    </header>
    
    <JumpGame />
    <Leaderboard />
  </div>
</template>

<script>
import JumpGame from './components/JumpGame.vue';
// FIX: Path changed to lowercase 'leaderboard.vue'
import Leaderboard from './components/leaderboard.vue'; 

export default {
  name: 'App',
  components: {
    JumpGame,
    Leaderboard
  }
};
</script>

<style>
body { background-color: #f5f6fa; margin: 0; padding: 20px; }
.app-header { text-align: center; color: #2c3e50; margin-bottom: 30px; }
</style>
