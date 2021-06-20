<template>
  <div class="container mt-2 px-5">
    <Popup id="loginFailureModal" :icon="'danger'" :headerText="'Error!'">
      <template v-slot:body>
        {{ error }}
      </template>
    </Popup>
    <h3>Login</h3>
    <div class="d-flex justify-content-center">
        <div class="width-40">
          <div class="list-group-item">
            <form @submit="submit" class="needs-validation" novalidate>
              <div class="form-floating mb-3 mt-2">
                <input type="email" class="form-control" id="email" v-model="email" @change="checkEmail" placeholder="name@example.com" required>
                <label for="email">Email address</label>
                <div class="invalid-feedback" id="invalid-email">
                  Incorrect email or password.
                </div>
              </div>
              <div class="form-floating mb-3">
                <input type="password" class="form-control" id="password" v-model="password" placeholder="Password" required>
                <label for="password">Password</label>
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
  name: 'Login',
  components: { Popup },
  data() {
    return {
      email: '',
      password: '',
      error: null
    };
  },
  methods: {
    submit(event) {
      event.preventDefault();
      const vm = this;
      vm.checkEmail();

      const form = document.querySelector('.needs-validation');
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        vm.login(vm.email, vm.password);
      }
      form.classList.add('was-validated');
    },
    login(email, password) {
      const vm = this;
      axios.post('/api/login', { email, password }, { withCredentials: true })
        .then((response) => {
          this.$store.commit('setIsAuth', response.data.isAuthenticated);
          this.$store.commit('setUser', response.data.user);
          this.$store.dispatch('getUserSubreddits');
          this.$store.dispatch('getModeratedSubreddits');
          vm.$router.push('/');
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            if (error.response.status === 401) {
              const emailElement = document.getElementById('email');
              emailElement.classList.add('is-invalid');
              emailElement.setCustomValidity('Incorrect email or password.');
              document.getElementById('invalid-email').innerHTML = emailElement.validationMessage;
              vm.password = '';
            }
            if (error.response.status === 500) {
              vm.handleError('Internal server error.');
            }
          } else if (error.request) {
            vm.handleError('No response received fom server.');
          } else {
            vm.handleError(`Error: ${error.message}`);
          }
        });
    },
    checkEmail() {
      const vm = this;
      const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailElement = document.getElementById('email');
      if (!emailRegEx.test(vm.email)) {
        emailElement.classList.add('is-invalid');
        emailElement.setCustomValidity('This is not a valid email.');
        document.getElementById('invalid-email').innerHTML = emailElement.validationMessage;
      } else {
        emailElement.classList.remove('is-invalid');
        emailElement.setCustomValidity('');
      }
    },
    handleError(failureMsg) {
      const vm = this;
      vm.error = failureMsg;
      vm.password = '';
      const loginFailureModal = new Modal(document.getElementById('loginFailureModal'));
      loginFailureModal.show();
    }
  },
};
</script>
