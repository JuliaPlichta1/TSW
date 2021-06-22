<template>
  <div class="container mt-2 px-2 mb-3">
    <Popup id="notLoggedInModal" :icon="'warning'" :headerText="'Not authenticated'">
      <template v-slot:body>
        You must be logged in to join to a community.
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal" @click="goToLogin">Login</button>
      </template>
    </Popup>
    <div class="text-start">
      <p class="fs-4 fw-bold mb-1">{{ query.q }}</p>
      <p class="text-muted">search result</p>
    </div>
    <p class="fs-6 fw-bold mb-1">{{ query.t }}</p>
    <div v-if="isEmptyResult">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="orange" class="bi bi-emoji-frown" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
      </svg>
      <p>
        Ups! There are no results for
        <span class="fw-bold">"{{ query.q }}"</span>
      </p>
    </div>
    <div class="m-3" v-if="query.t === 'subreddits'">
      <div class="row" v-for="(subreddit, id) in result" :key="id">
        <div class="list-group overflow-auto list-group-item">
          <router-link :to="'/r/'+subreddit.name" class="list-group-item-action">
            <div class="d-flex justify-content-between align-items-center text-start">
              <div class="mx-1">
                <div class="fw-bold">
                  r/{{ subreddit.name }}
                </div>
                <small><small class="text-muted">{{ subreddit.members }} {{ subreddit.members === '1' ? 'Member' : 'Members' }}</small></small>
              </div>
              <small class="mb-1 mx-1">{{ subreddit.description }} </small>
              <div v-if="!subreddit.moderator">
                <button class="btn btn-outline-primary rounded-pill btn-sm mx-1 join" @click="submit(subreddit, $event)" v-if="subreddit.userJoined">Leave</button>
                <button class="btn btn-primary rounded-pill btn-sm mx-1 join" @click="submit(subreddit, $event)" v-else>Join</button>
              </div>
              <div v-else>
                <button class="btn btn-warning rounded-pill btn-sm mx-1 join" disabled>Moderator</button>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
    <div class="m-3" v-else-if="query.t === 'posts'">
      <div v-for="(post, id) in result" :key="id">
        <router-link :to="'/r/'+post.name+'/comments/'+post.id" class="list-group-item list-group-item-action" v-if="dataLoaded">
          <Post :post="post" :subredditName="post.name" :withSubredditName="true" @vote="vote" />
        </router-link>
      </div>
    </div>
    <div class="my-2" v-if="showMoreBtn">
      <button class="btn btn-primary" @click="search">Load more</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import Post from '../components/Post.vue';
import Popup from '../components/Popup.vue';
import { useStore } from 'vuex';
import { Modal } from 'bootstrap';

export default {
  components: { Post, Popup },
  name: 'SearchResults',
  props: {
    socket: Object,
  },
  setup(props) {
    const query = useRoute().query;
    const store = useStore();
    const result = ref([]);
    const isEmptyResult = ref(false);
    const dataLoaded = ref(false);
    const showMoreBtn = ref(false);
    let page = 0;
    const limit = 5;

    const search = async() => {
      page += 1;
      let data = [];
      data = await (await axios
        .get(`/api/subreddit/search?q=${query.q}&type=${query.t}&page=${page}&limit=${limit}`)).data;

      if (data.length === 0) {
        isEmptyResult.value = true;
        showMoreBtn.value = false;
      } else {
        if (page === 1) {
          result.value = data;
          dataLoaded.value = true;
          showMoreBtn.value = true;
        } else {
          result.value = result.value.concat(data);
        }
      }

      // result.value = await (await axios.get(`/api/subreddit/search?q=${query.q}&type=${query.t}
      //   &page=${page}&limit=${limit}`)).data;
      // compareUserSubreddits();
      // if (result.value.length === 0) {
      //   isEmptyResult.value = true;
      // }
    };

    const compareUserSubreddits = () => {
      if (store.getters.user && store.getters.userSubreddits) {
        result.value.forEach(subreddit => {
          if (store.getters.userSubreddits.some(e => e.id === subreddit.id)) {
            subreddit.userJoined = true;
          } else {
            subreddit.userJoined = false;
          }
          if (store.getters.moderatedSubreddits.some(e => e.id === subreddit.id)) {
            subreddit.moderator = true;
          } else {
            subreddit.moderator = false;
          }
        });
      }
    };

    const updatePostVoteResult = async(postId) => {
      const data = await (await axios.get(`/api/subreddit/votes/${postId}`)).data;
      const index = result.value.findIndex(el => el.id === postId);

      result.value[index].votes_result = data.votes_result;
    };

    const deletePost = (postId) => {
      result.value = result.value.filter(post => post.id !== postId);
    };

    props.socket.on('postDeleted', async(postId) => {
      console.log('[SOCKET]: Deleted post: ', postId);
      if (query.t === 'posts') {
        deletePost(postId);
      }
    });

    onMounted(search);

    return {
      query,
      result,
      isEmptyResult,
      dataLoaded,
      showMoreBtn,
      search,
      isAuth: computed(() => store.getters.isAuth),
      user: computed(() => store.getters.user),
      compareUserSubreddits,
      updatePostVoteResult,
    };
  },
  methods: {
    submit(subreddit, event) {
      event.preventDefault();
      if (!this.isAuth) {
        const notLoggedInModal = new Modal(document.getElementById('notLoggedInModal'));
        notLoggedInModal.show();
      } else {
        if (subreddit.userJoined) {
          this.leave(subreddit);
        } else {
          this.join(subreddit);
        }
      }
    },
    join(subreddit) {
      axios.post(`/api/user/join/${subreddit.name}`)
        .then((_result) => {
          this.$store.commit('addUserSubreddit', subreddit);
          this.compareUserSubreddits();
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    },
    leave(subreddit) {
      axios.delete(`/api/user/leave/${subreddit.name}`)
        .then((_result) => {
          this.$store.commit('removeUserSubreddit', subreddit.id);
          this.compareUserSubreddits();
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    },
    goToLogin() {
      this.$router.push('/login');
    },
    vote(data) {
      axios.post(`/api/user/vote/${data.postId}`, { vote: data.vote })
        .then((_response) => {
          this.updatePostVoteResult(data.postId);
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    },
  },
};
</script>
