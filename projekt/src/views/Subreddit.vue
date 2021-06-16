<template>
  <div class="" v-if="dataLoaded">
    <Popup id="notLoggedInModal" :icon="'warning'" :headerText="'Not authenticated'">
      <template v-slot:body>
        You must be logged in to join to a community.
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal" @click="goToLogin">Login</button>
      </template>
    </Popup>
    <div class="dashboard bg-light py-2">
      <h2>r/{{ subreddit.name }}</h2>
      <small>{{ subreddit.members }} Members</small>
      <div class="mb-2">{{ subreddit.description }}</div>
      <button class="btn btn-outline-primary rounded-pill px-5 mx-1" @click="submit(subreddit, $event)" v-if="subreddit.userJoined">Leave</button>
      <button class="btn btn-primary rounded-pill px-5 mx-1" @click="submit(subreddit, $event)" v-else>Join</button>
    </div>
    <div class="container mt-2 px-2 mb-3" v-for="(post, id) in posts" :key="id">
      <Post :post="post" />
    </div>
    <div v-if="posts.length === 0">
      <p>There are no posts yet</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { Modal } from 'bootstrap';
import Post from '../components/Post.vue';
import Popup from '../components/Popup.vue';

export default {
  components: { Post, Popup },
  name: 'Subreddit',
  setup(_props) {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const posts = ref([]);
    const subreddit = ref({});
    const dataLoaded = ref(false);

    const getSubredditPosts = async() => {
      try {
        const result = await (await axios.get(`/api/subreddit/r/${route.params.subreddit}`)).data;
        posts.value = result.posts;
        subreddit.value = result.subreddit;

        if (store.getters.user && store.getters.userSubreddits) {
          if (store.getters.userSubreddits.some(e => e.id === subreddit.value.id)) {
            subreddit.value.userJoined = true;
          } else {
            subreddit.value.userJoined = false;
          }
        }
        dataLoaded.value = true;
      } catch (error) {
        if (error.response.status === 400) {
          router.push({
            name: 'NotFound',
            params: { catchAll: route.path.substring(1).split('/') }
          });
        }
      }
    };

    onMounted(getSubredditPosts);

    return {
      dataLoaded,
      posts,
      subreddit,
      getSubredditPosts,
      isAuth: computed(() => store.getters.isAuth),
      user: computed(() => store.getters.user),
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
          console.log('user joined');
          this.$store.commit('addUserSubreddit', subreddit);
          this.subreddit.userJoined = true;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    leave(subreddit) {
      axios.delete(`/api/user/leave/${subreddit.name}`)
        .then((_result) => {
          console.log('user left');
          this.$store.commit('removeUserSubreddit', subreddit.id);
          this.subreddit.userJoined = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    goToLogin() {
      this.$router.push('/login');
    },
  },
};
</script>
