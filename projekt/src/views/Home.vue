<template>
  <div>
    <Popup id="notLoggedInModal" :icon="'warning'" :headerText="'Not authenticated'">
      <template v-slot:body>
        {{ notLoggedInMessage }}.
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal" @click="goToLogin">Login</button>
      </template>
    </Popup>
    <div class="container mt-2 px-2 mb-3">
      <div class="d-flex justify-content-center">
        <div class="width-40 m-2">
          <div class="btn-group w-100" role="group">
            <input type="radio" class="btn-check" v-model="display" value="newest" id="newest" autocomplete="off" @click="loadNewest">
            <label class="btn btn-outline-secondary" for="newest">Newest</label>
            <input type="radio" class="btn-check" v-model="display" value="best" id="best" autocomplete="off" @click="loadBest">
            <label class="btn btn-outline-secondary" for="best">Best</label>
          </div>
          <div class="d-flex justify-content-center" v-for="(post, id) in posts" :key="id">
            <router-link :to="'/r/'+post.name+'/comments/'+post.id" class="list-group-item list-group-item-action" v-if="dataLoaded">
              <Post :post="post" :subredditName="post.name" :withSubredditName="true" :overflow="false"
                :thumbnail="false" :userIsModerator="post.moderator" @vote="vote"
                @openConfirmDeleteModal="openConfirmDeleteModal" @openNotLoggedInModal="openNotLoggedInModal" />
            </router-link>
          </div>
          <div class="my-2" v-if="showMoreBtn">
            <div v-if="display === 'newest'">
              <button class="btn btn-primary" @click="addNewestPosts">Load more</button>
            </div>
            <div v-else-if="display === 'best'">
              <button class="btn btn-primary" @click="addBestPosts">Load more</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Popup from '../components/Popup.vue';
import Post from '../components/Post.vue';
import { Modal } from 'bootstrap';
import { useStore } from 'vuex';
import { ref, onMounted } from 'vue';

export default {
  components: { Popup, Post },
  name: 'Home',
  emits: ['openConfirmDeleteModal'],
  data() {
    return {
      notLoggedInMessage: null,
      display: 'newest',
    };
  },
  props: {
    socket: Object,
  },
  setup(props) {
    const store = useStore();
    const posts = ref([]);
    const dataLoaded = ref(false);
    const showMoreBtn = ref(false);
    let page = 0;
    const limit = 5;

    const addNewestPosts = async(resetPage = false) => {
      if (resetPage === true) {
        page = 0;
      }
      page += 1;
      let data = [];
      if (!store.getters.isAuth) {
        data = await (await axios
          .get(`/api/subreddit/posts/newest?page=${page}&limit=${limit}`)).data;
      } else {
        data = await (await axios
          .get(`/api/subreddit/posts/newest/userSubreddits?page=${page}&limit=${limit}`)).data;
      }

      if (data.length === 0) {
        showMoreBtn.value = false;
      } else {
        if (page === 1) {
          posts.value = data;
          dataLoaded.value = true;
          showMoreBtn.value = true;
        } else {
          posts.value = posts.value.concat(data);
        }
      }
      if (store.getters.isAuth) compareUserModerator();
    };

    const addBestPosts = async(resetPage = false) => {
      if (resetPage === true) {
        page = 0;
      }
      page += 1;
      let data = [];
      if (!store.getters.isAuth) {
        data = await (await axios
          .get(`/api/subreddit/posts/best?page=${page}&limit=${limit}`)).data;
      } else {
        data = await (await axios
          .get(`/api/subreddit/posts/best/userSubreddits?page=${page}&limit=${limit}`)).data;
      }

      if (data.length === 0) {
        showMoreBtn.value = false;
      } else {
        if (page === 1) {
          posts.value = data;
          dataLoaded.value = true;
          showMoreBtn.value = true;
        } else {
          posts.value = posts.value.concat(data);
        }
      }
      if (store.getters.isAuth) compareUserModerator();
    };

    const compareUserModerator = () => {
      posts.value.forEach(post => {
        if (store.getters.moderatedSubreddits.some(e => e.name === post.name)) {
          post.moderator = true;
        } else {
          post.moderator = false;
        }
      });
    };

    const updatePostVoteResult = async(postId) => {
      const data = await (await axios.get(`/api/subreddit/votes/${postId}`)).data;
      const index = posts.value.findIndex(el => el.id === postId);

      if (posts.value[index] !== 'undefined') {
        posts.value[index].votes_result = data.votes_result;
      }
    };

    const deletePost = (postId) => {
      posts.value = posts.value.filter(post => post.id !== postId);
    };

    onMounted(addNewestPosts);

    props.socket.on('postDeleted', async(postId) => {
      console.log('[SOCKET]: Deleted post: ', postId);
      deletePost(postId);
    });

    props.socket.on('postAdded', async(post) => {
      console.log('[SOCKET]: Added post: ', post.id);
      // TODO
    });

    props.socket.on('votedOnPost', async(postId) => {
      console.log('[SOCKET]: Voted on post: ', postId);
      updatePostVoteResult(postId);
    });

    return {
      posts,
      dataLoaded,
      showMoreBtn,
      updatePostVoteResult,
      addNewestPosts,
      addBestPosts,
    };
  },
  methods: {
    vote(data) {
      axios.post(`/api/user/vote/${data.postId}`, { vote: data.vote })
        .then((_response) => {
          this.socket.emit('voted', data.postId);
          this.updatePostVoteResult(data.postId);
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    },
    openNotLoggedInModal(message) {
      this.notLoggedInMessage = message;
      const notLoggedInModal = new Modal(document.getElementById('notLoggedInModal'));
      notLoggedInModal.show();
    },
    openConfirmDeleteModal(data) {
      const vm = this;
      vm.$emit('openConfirmDeleteModal', data);
    },
    goToLogin() {
      this.$router.push('/login');
    },
    loadNewest() {
      this.addNewestPosts(true);
    },
    loadBest() {
      this.addBestPosts(true);
    },
  },
};
</script>
