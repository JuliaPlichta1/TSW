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
      <div class="container mt-2 px-2 mb-3">
        <div class="d-flex justify-content-center">
          <div style="width: 40rem">
            <div class="d-flex flex-column justify-content-center">
              <h2>r/{{ subreddit.name }}</h2>
              <small class="text-muted">{{ subreddit.members }} {{ subreddit.members === '1' ? 'Member' : 'Members' }}</small>
              <div class="mb-1">{{ subreddit.description }}</div>
              <div>
                <button class="btn mb-2"
                  :class=" isEditOpen ? 'btn-outline-warning' : 'btn-warning'"
                  v-if="subreddit.moderator" @click="[isEditOpen = !isEditOpen]">
                  Edit description
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="w-100 p-3 list-group-item" v-if="isEditOpen">
              <textarea class="form-control" name="edit-description" id="edit-description"
                placeholder="Describe a subreddit in a few words" v-model="editDescription" rows="3" maxlength="255"></textarea>
              <button class="btn btn-warning mt-2" @click="editSubredditDescription" :disabled="!editDescription">Submit</button>
            </div>
            <div class="moderators mb-1" v-if="isAuth">
              <small>
                Moderators:
                <div v-for="(user, id) in subreddit.moderators" :key="id">
                  <div class="fw-bold text-warning" v-if="subreddit.moderator">
                    You are a moderator!
                  </div>
                  <div v-else>
                    u/{{ user.nickname }}
                  </div>
                </div>
              </small>
            </div>
            <div v-if="!subreddit.moderator">
              <button class="btn btn-outline-primary rounded-pill px-5 mx-1" @click="submit(subreddit, $event)" v-if="subreddit.userJoined">Leave</button>
              <button class="btn btn-primary rounded-pill px-5 mx-1" @click="submit(subreddit, $event)" v-else>Join</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-2 px-2 mb-3">
      <div class="d-flex justify-content-center">
        <div style="width: 40rem">
          <div class="w-100 p-3 list-group-item" v-if="isAuth">
            <input type="text" class="form-control" name="createPost" id="createPost" placeholder="Create Post" @click="goToCreatePost">
          </div>
          <div class="d-flex justify-content-center" v-for="(post, id) in posts" :key="id">
            <router-link :to="'/r/'+subreddit.name+'/comments/'+post.id" class="list-group-item list-group-item-action">
              <Post :post="post" :subredditName="subreddit.name" :overflow="false"
                :thumbnail="false" :userIsModerator="subreddit.moderator"
                @openConfirmDeleteModal="openConfirmDeleteModal" @vote="vote" />
            </router-link>
          </div>
        </div>
      </div>
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
  emits: ['openConfirmDeleteModal', 'openFailureModal'],
  data() {
    return {
      isEditOpen: false,
      editDescription: '',
    };
  },
  props: {
    socket: Object,
  },
  setup(props) {
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
        if (store.getters.user && store.getters.moderatedSubreddits) {
          if (store.getters.moderatedSubreddits.some(e => e.id === subreddit.value.id)) {
            subreddit.value.moderator = true;
          } else {
            subreddit.value.moderator = false;
          }
        }
        dataLoaded.value = true;
      } catch (error) {
        if (error.response.status === 400) {
          router.replace({
            name: 'NotFound',
            params: { catchAll: route.path.substring(1).split('/') }
          });
        }
      }
    };

    const updatePostVoteResult = async(postId) => {
      const data = await (await axios.get(`/api/subreddit/votes/${postId}`)).data;
      const index = posts.value.findIndex(el => el.id === postId);

      posts.value[index].votes_result = data.votes_result;
    };

    const deletePost = (postId) => {
      posts.value = posts.value.filter(post => post.id !== postId);
    };

    props.socket.on('postDeleted', async(postId) => {
      console.log('[SOCKET]: Deleted post: ', postId);
      deletePost(postId);
    });

    props.socket.on('postAdded', async(post) => {
      console.log('[SOCKET]: Added post: ', post.id);
      // TODO
    });

    onMounted(getSubredditPosts);

    return {
      dataLoaded,
      posts,
      subreddit,
      getSubredditPosts,
      updatePostVoteResult,
      isAuth: computed(() => store.getters.isAuth),
      user: computed(() => store.getters.user),
    };
  },
  methods: {
    editSubredditDescription() {
      const vm = this;
      axios.patch(`/api/subreddit/r/${vm.subreddit.name}`, { description: vm.editDescription })
        .then((response) => {
          console.log(response.data);
          vm.editDescription = '';
          vm.isEditOpen = false;
          vm.getSubredditPosts();
        })
        .catch((error) => {
          console.log(error.response);
          vm.$emit('openFailureModal', error.response.data);
        });
    },
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
          this.subreddit.userJoined = true;
          this.getSubredditPosts();
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    },
    leave(subreddit) {
      axios.delete(`/api/user/leave/${subreddit.name}`)
        .then((_result) => {
          this.$store.commit('removeUserSubreddit', subreddit.id);
          this.subreddit.userJoined = false;
          this.getSubredditPosts();
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    },
    goToLogin() {
      this.$router.push('/login');
    },
    goToCreatePost() {
      this.$router.push(`/r/${this.subreddit.name}/submit`);
    },
    openConfirmDeleteModal(data) {
      const vm = this;
      vm.$emit('openConfirmDeleteModal', data);
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
