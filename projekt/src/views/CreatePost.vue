<template>
  <div class="container mt-2 px-5">
    <Popup id="createPostSuccessModal" :icon="'success'" :headerText="'Congratulations!'">
      <template v-slot:body>
        The post has been created succesfully.
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal" @click="goToPost">View post</button>
      </template>
    </Popup>
    <Popup id="createPostFailureModal" :icon="'danger'" :headerText="'Error!'">
      <template v-slot:body>
        {{ error }}
      </template>
    </Popup>
    <h3>Create Post</h3>
    <div class="d-flex justify-content-center">
      <div style="width: 40rem">
        <div class="list-group-item">
          <form @submit="submit" class="needs-validation" novalidate enctype="multipart/form-data">
            <div class="form-floating mb-3 mt-2">
              <input type="text" class="form-control" id="title" v-model="title" placeholder="title" required>
              <label for="title">Title</label>
              <div class="invalid-feedback" id="invalid-title">
                Title cannot be empty.
              </div>
            </div>
            <div class="mb-3">
              <textarea class="form-control" id="content" v-model="content" placeholder="Content" rows="3"></textarea>
            </div>
            <div class="mb-3 text-start">
              <label for="image-file">Upload an image</label>
              <input type="file" class="form-control" id="image-file" ref="imageFile" name="image-file"
                accept="image/*" @change="checkImage">
              <div class="invalid-feedback" id="invalid-image-file">
                Invalid file type.
              </div>
            </div>
            <div class="form-floating mb-3">
              <input type="url" class="form-control" id="video-url" v-model="videoUrl" placeholder="">
              <label for="video-url">YouTube video link</label>
              <div class="invalid-feedback" id="invalid-video-url">
                Invalid URL.
              </div>
            </div>
            <button type="submit" class="btn btn-primary px-4 mb-3">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap';
import Popup from '../components/Popup.vue';

export default {
  name: 'CreatePost',
  components: { Popup },
  data() {
    return {
      title: '',
      content: '',
      videoUrl: '',
      error: '',
      postId: null,
    };
  },
  methods: {
    submit(event) {
      event.preventDefault();
      const vm = this;
      const form = document.querySelector('.needs-validation');
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        vm.createPost();
      }
      form.classList.add('was-validated');
    },
    checkImage() {
      const file = this.$refs.imageFile.files[0];
      const imageFileElement = document.getElementById('image-file');
      if (file.type === 'image/jpeg' || file.type === 'image/gif' ||
        file.type === 'image/png') {
        imageFileElement.classList.remove('is-invalid');
        imageFileElement.setCustomValidity('');
      } else {
        imageFileElement.classList.add('is-invalid');
        imageFileElement.setCustomValidity('Invalid file type.');
        document.getElementById('invalid-image-file').innerHTML = imageFileElement.validationMessage;
      }
    },
    createPost() {
      const vm = this;
      const file = vm.$refs.imageFile.files[0];
      const formData = new FormData();
      formData.append('title', vm.title);
      formData.append('content', vm.content);
      formData.append('image-file', file);
      formData.append('video_url', vm.videoUrl);
      axios.post(`/api/subreddit/r/${vm.$route.params.subreddit}/post`,
        formData, { headers: { 'Content-Type': 'undefined' } })
        .then((result) => {
          console.log('Created successfully!');
          vm.postId = result.data.id;
          vm.resetForm();
          const createPostSuccessModal = new Modal(document.getElementById('createPostSuccessModal'));
          createPostSuccessModal.show();
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            if (error.response.status === 400) {
              vm.handleError(error.response.data);
            }
            if (error.response.status === 500) {
              vm.handleError('Internal server error.');
            }
          } else if (error.request) {
            vm.handleError('No response received from server.');
          } else {
            vm.handleError(`Error: ${error.message}`);
          }
        });
    },
    handleError(failureMsg) {
      const vm = this;
      vm.error = failureMsg;
      vm.resetForm();
      const createPostFailureModal = new Modal(document.getElementById('createPostFailureModal'));
      createPostFailureModal.show();
    },
    resetForm() {
      const vm = this;
      const form = document.querySelector('.needs-validation');
      form.classList.remove('was-validated');
      vm.title = '';
      vm.content = '';
      vm.videoUrl = '';
    },
    goToPost() {
      const vm = this;
      this.$router.push(`/r/${vm.$route.params.subreddit}/comments/${vm.postId}`);
    }
  },
};
</script>
