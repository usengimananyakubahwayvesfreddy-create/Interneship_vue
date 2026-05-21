import axios from 'axios';

// Using JSONPlaceholder as a public test mock URL api as specified by the manual
const API_BASE_URL = 'https://typicode.com';

export default {
  /**
   * Posts player high score data to the mock api
   */
  async submitHighScore(playerName, score) {
    try {
      const response = await axios.post(`${API_BASE_URL}/posts`, {
        name: playerName,
        score: score
      });
      console.log('Score submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting high score:', error);
      throw error;
    }
  },

  /**
   * Fetches high scores list data from the mock api
   */
  async fetchHighScores() {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts?_limit=5`);
      
      // Because JSONPlaceholder returns mock blog posts, we map them 
      // to look like actual game leaderboard score elements
      return response.data.map((item, index) => ({
        id: item.id,
        name: `Player ${index + 1}`,
        score: Math.floor(Math.random() * 50) + 10 // Mocking some high scores
      }));
    } catch (error) {
      console.error('Error fetching high scores:', error);
      throw error;
    }
  }
};
