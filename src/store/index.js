import { createStore } from 'vuex';

export default createStore({
  state() {
    return {
      gameScore: 0,
      difficultyLevel: 1,
      gameOver: false
    };
  },
  getters: {
    currentScore(state) {
      return state.gameScore;
    },
    difficultyLevel(state) {
      return state.difficultyLevel;
    },
    gameOver(state) {
      return state.gameOver;
    }
  },
  mutations: {
    INCREMENT_SCORE(state) {
      state.gameScore += 1;
    },
    SET_DIFFICULTY(state, level) {
      state.difficultyLevel = level;
    },
    SET_GAME_OVER(state, status) {
      state.gameOver = status;
    },
    RESET_GAME_STATE(state) {
      state.gameScore = 0;
      state.difficultyLevel = 1;
      state.gameOver = false;
    }
  },
  actions: {
    addScore({ commit }) {
      commit('INCREMENT_SCORE');
    },
    changeDifficulty({ commit }, level) {
      commit('SET_DIFFICULTY', level);
    },
    setGameOver({ commit }, status) {
      commit('SET_GAME_OVER', status);
    },
    resetGame({ commit }) {
      commit('RESET_GAME_STATE');
    }
  }
});
