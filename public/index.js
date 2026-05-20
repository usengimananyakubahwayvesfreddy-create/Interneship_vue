import { createStore } from 'vuex';

export default createStore({
  state() {
    return {
      score: 0,
      gameOver: false
    };
  },
  mutations: {
    INCREMENT_SCORE(state) {
      state.score += 1;
    },
    SET_GAME_OVER(state, status) {
      state.gameOver = status;
    },
    RESET_GAME_STATE(state) {
      state.score = 0;
      state.gameOver = false;
    }
  },
  actions: {
    incrementScore({ commit }) {
      commit('INCREMENT_SCORE');
    },
    setGameOver({ commit }, status) {
      commit('SET_GAME_OVER', status);
    },
    resetGame({ commit }) {
      commit('RESET_GAME_STATE');
    }
  }
});
