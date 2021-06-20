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
        <div style="width: 40rem">
          <div>
            <p class="fs-4 fw-bold mb-1">Newest posts</p>
          </div>
          <div class="d-flex justify-content-center" v-for="(post, id) in posts" :key="id">
            <router-link :to="'/r/'+post.name+'/comments/'+post.id" class="list-group-item list-group-item-action">
              <Post :post="post" :subredditName="post.name" :withSubredditName="true" :overflow="false"
                :thumbnail="false" :userIsModerator="post.moderator" @vote="vote"
                @openConfirmDeleteModal="openConfirmDeleteModal" @openNotLoggedInModal="openNotLoggedInModal" />
            </router-link>
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
      notLoggedInMessage: null
    };
  },
  props: {
    socket: Object,
  },
  setup(props) {
    const store = useStore();
    const posts = ref([]);
    const dataLoaded = ref(false);

    const getNewestPosts = async() => {
      posts.value = await (await axios.get('/api/subreddit/posts/newest')).data;
      dataLoaded.value = true;
    };

    const getNewestPostsUserSubreddits = async() => {
      posts.value = await (await axios.get('/api/subreddit/posts/newest/userSubreddits')).data;
      compareUserModerator();
      dataLoaded.value = true;
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

      posts.value[index].votes_result = data.votes_result;
    };

    const deletePost = (postId) => {
      posts.value = posts.value.filter(post => post.id !== postId);
    };

    if (store.getters.isAuth) {
      onMounted(getNewestPostsUserSubreddits);
    } else {
      onMounted(getNewestPosts);
    }

    props.socket.on('postDeleted', async(postId) => {
      console.log('[SOCKET]: Deleted post: ', postId);
      deletePost(postId);
    });

    props.socket.on('postAdded', async(post) => {
      console.log('[SOCKET]: Added post: ', post.id);
      // TODO
    });

    return {
      posts,
      dataLoaded,
      updatePostVoteResult,
    };
  },
  methods: {
    vote(data) {
      axios.post(`/api/user/vote/${data.postId}`, { vote: data.vote })
        .then((_response) => {
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
  },
};
</script>
