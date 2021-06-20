<template>
  <div class="container mt-2 px-5">
    <Popup id="createSubredditSuccessModal" :icon="'success'" :headerText="'Congratulations!'">
      <template v-slot:body>
        The subreddit has been created succesfully.
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal" @click="goToSubreddit">View subreddit</button>
      </template>
    </Popup>
    <Popup id="createSubredditFailureModal" :icon="'danger'" :headerText="'Error!'">
      <template v-slot:body>
        {{ error }}
      </template>
    </Popup>
    <h3>Create subreddit</h3>
      <div class="d-flex justify-content-center">
        <div class="width-40">
          <div class="list-group-item">
            <form @submit="submit" class="needs-validation" novalidate>
              <div class="form-floating mb-3 mt-2">
                <input type="text" class="form-control" id="name" v-model="name" @change="checkName"
                  placeholder="name" v-lowercase required>
                <label for="name">Name</label>
                <div class="invalid-feedback" id="invalid-name">
                  Name cannot be empty.
                </div>
              </div>
              <div class="mb-3">
                <textarea class="form-control" id="description" v-model="description"
                  placeholder="Describe a subreddit in a few words." rows="3" required></textarea>
                <div class="invalid-feedback" id="invalid-description">
                  Describe field cannot be empty.
                </div>
              </div>
              <button type="submit" class="btn btn-primary px-4">Submit</button>
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
  name: 'CreateSubreddit',
  components: { Popup },
  data() {
    return {
      name: '',
      description: '',
      error: '',
      subredditName: null,
    };
  },
  directives: {
    lowercase: {
      updated: (el) => { el.value = el.value.toLowerCase(); }
    }
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
        vm.createSubreddit(vm.name.toLowerCase(), vm.description);
      }
      form.classList.add('was-validated');
    },
    checkName() {
      const nameElement = document.getElementById('name');
      nameElement.classList.remove('is-invalid');
      nameElement.setCustomValidity('');
    },
    createSubreddit(name, description) {
      const vm = this;
      axios.post('/api/subreddit/create', { name, description })
        .then((response) => {
          console.log('Created succesfully');
          this.$store.commit('addModeratedSubreddits', response.data);
          vm.subredditName = response.data.id;
          vm.resetForm();
          const createSubredditSuccessModal = new Modal(document.getElementById('createSubredditSuccessModal'));
          createSubredditSuccessModal.show();
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            if (error.response.status === 409) {
              if (error.response.data === 'There is already a subreddit with this name') {
                document.getElementById('name').setCustomValidity(error.response.data);
                document.getElementById('invalid-name').innerHTML = error.response.data;
              }
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
    resetForm() {
      const vm = this;
      const form = document.querySelector('.needs-validation');
      form.classList.remove('was-validated');
      vm.name = '';
      vm.description = '';
    },
    handleError(failureMsg) {
      const vm = this;
      vm.error = failureMsg;
      vm.resetForm();
      const createSubredditFailureModal = new Modal(document.getElementById('createSubredditFailureModal'));
      createSubredditFailureModal.show();
    },
    goToSubreddit() {
      const vm = this;
      this.$router.push(`/r/${vm.subredditName}`);
    }
  },
};
</script>
