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
    <router-view :key="$route.fullPath"
      @openConfirmDeleteModal="openConfirmDeleteModal"
      @openFailureModal="openFailureModal" />
  </div>
</template>

<script>
import axios from 'axios';
import Navbar from './components/Navbar.vue';
import Popup from './components/Popup.vue';
import { Modal } from 'bootstrap';

export default {
  name: 'App',
  components: { Navbar, Popup },
  data() {
    return {
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
          if (this.$router.currentRoute.value.name === 'Comments') {
            this.$router.back();
          }
          // TODO socket emits postDeleted
        })
        .catch((error) => {
          console.log(error.response.data);
          vm.openFailureModal(error.response.data);
        });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
