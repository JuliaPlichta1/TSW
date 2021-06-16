import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import axios from 'axios';

export default createStore({
  plugins: [createPersistedState({
    storage: window.sessionStorage
  })],
  state: {
    isAuth: false,
    user: null,
    userSubreddits: []
  },
  getters: {
    isAuth: state => state.isAuth,
    user: state => state.user,
    userSubreddits: state => state.userSubreddits,
  },
  mutations: {
    setIsAuth(state, value) {
      state.isAuth = value;
    },
    setUser(state, value) {
      state.user = value;
    },
    setUserSubreddits(state, value) {
      state.userSubreddits = value;
    },
    addUserSubreddit(state, subreddit) {
      state.userSubreddits.push(subreddit);
    },
    removeUserSubreddit(state, id) {
      state.userSubreddits = state.userSubreddits.filter(subreddit => subreddit.id !== id);
    }
  },
  actions: {
    logout({ commit }) {
      axios.get('/api/logout')
        .then((_response) => {
          commit('setIsAuth', false);
          commit('setUser', null);
          commit('setUserSubreddits', null);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getUserSubreddits({ commit }) {
      axios.get('/api/user/subreddits')
        .then((response) => {
          commit('setUserSubreddits', response.data);
          console.log('user subreddits');
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  modules: {}
});
