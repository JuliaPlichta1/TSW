import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import axios from 'axios';

export default createStore({
  plugins: [createPersistedState({
    storage: window.sessionStorage
  })],
  state: {
    isAuth: false,
    user: null
  },
  getters: {
    isAuth: state => state.isAuth,
    user: state => state.user
  },
  mutations: {
    setIsAuth(state, value) {
      state.isAuth = value;
    },
    setUser(state, value) {
      state.user = value;
    }
  },
  actions: {
    logout({ commit }) {
      axios.get('/api/logout')
        .then((_response) => {
          commit('setIsAuth', false);
          commit('setUser', null);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  modules: {}
});
