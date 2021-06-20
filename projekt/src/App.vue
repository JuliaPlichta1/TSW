<template>
  <div class="app-container">
    <Navbar />
    <Popup id="cofirmDeleteModal" :icon="'warning'" :headerText="'Confirm delete'" :footerButtonText="'Cancel'">
      <template v-slot:body>
        Are you sure you want to delete this post?
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal" @click="deletePost">Delete</button>
      </template>
    </Popup>
    <Popup id="failureModal" :icon="'danger'" :headerText="'Error!'">
      <template v-slot:body>
        {{ error }}
      </template>
    </Popup>
    <router-view v-if="socket" :key="$route.fullPath" :socket="socket"
      @openConfirmDeleteModal="openConfirmDeleteModal"
      @openFailureModal="openFailureModal"
      @addPost="addPost" />
  </div>
</template>

<script>
import axios from 'axios';
import Navbar from './components/Navbar.vue';
import Popup from './components/Popup.vue';
import { Modal } from 'bootstrap';
import io from 'socket.io-client';

export default {
  name: 'App',
  components: { Navbar, Popup },
  data() {
    return {
      socket: null,
      error: null,
    };
  },
  methods: {
    openConfirmDeleteModal(data) {
      const vm = this;
      vm.subredditName = data.subredditName;
      vm.postId = data.postId;
      const cofirmDeleteModal = new Modal(document.getElementById('cofirmDeleteModal'));
      cofirmDeleteModal.show();
    },
    openFailureModal(failureMsg) {
      const vm = this;
      vm.error = failureMsg;
      const failureModal = new Modal(document.getElementById('failureModal'));
      failureModal.show();
    },
    deletePost() {
      const vm = this;
      axios.delete(`/api/subreddit/r/${vm.subredditName}/comments/${vm.postId}`)
        .then((result) => {
          console.log(result.data);
          vm.socket.emit('deletedPost', vm.postId);
        })
        .catch((error) => {
          console.log(error.response.data);
          vm.openFailureModal(error.response.data);
        });
    },
    addPost(post) {
      const vm = this;
      vm.socket.emit('addedPost', post);
    },
  },
  created() {
    const port = process.env.PORT || 5000;
    this.socket = io(`http://localhost:${port}`);
  },
};
</script>

<style lang="scss">
@import '@/styles/style.scss';
</style>
