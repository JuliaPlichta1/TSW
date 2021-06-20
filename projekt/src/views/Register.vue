<template>
  <div class="container mt-2 px-5">
    <Popup id="registerSuccessModal" :icon="'success'" :headerText="'Congratulations!'">
      <template v-slot:body>
        Your account has been created succesfully.
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal" @click="goToLogin">Login</button>
      </template>
    </Popup>
    <Popup id="registerFailureModal" :icon="'danger'" :headerText="'Error!'">
      <template v-slot:body>
        {{ error }}
      </template>
    </Popup>
    <h3>Register</h3>
    <div class="d-flex justify-content-center">
        <div class="width-40">
          <div class="list-group-item">
            <form @submit="submit" class="needs-validation" novalidate>
              <div class="form-floating mb-3 mt-2">
                <input type="text" class="form-control" id="username" v-model="username" @change="checkUsername"
                  placeholder="username" autocomplete="new-username" required>
                <label for="username">Username</label>
                <div class="invalid-feedback" id="invalid-username">
                  Username cannot be empty.
                </div>
              </div>
              <div class="form-floating mb-3">
                <input type="email" class="form-control" id="email" v-model="email" @change="checkEmail"
                  placeholder="name@example.com" autocomplete="new-email" required>
                <label for="email">Email address</label>
                <div class="invalid-feedback" id="invalid-email">
                  This is not a valid email address.
                </div>
              </div>
              <div class="form-floating mb-3">
                <input type="password" class="form-control" id="password" v-model="password" @change="checkPasswords"
                  placeholder="Password" autocomplete="new-password" required>
                <label for="password">Password</label>
              </div>
              <div class="form-floating mb-3">
                <input type="password" class="form-control" id="confirm-password" v-model="confirmPassword" @change="checkPasswords"
                  placeholder="Confirm password" required>
                <label for="confirm-password">Confirm password</label>
                <div class="invalid-feedback" id="invalid-password">
                  Please confirm password.
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
  name: 'Register',
  components: { Popup },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: null
    };
  },
  methods: {
    submit(event) {
      event.preventDefault();
      const vm = this;
      vm.checkEmail();
      vm.checkPasswords();

      const form = document.querySelector('.needs-validation');
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        vm.register(vm.username, vm.email, vm.password, vm.confirmPassword);
      }
      form.classList.add('was-validated');
    },
    checkUsername() {
      const usernameElement = document.getElementById('username');
      usernameElement.classList.remove('is-invalid');
      usernameElement.setCustomValidity('');
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
    checkPasswords() {
      const vm = this;
      const confirmPasswordElement = document.getElementById('confirm-password');
      if (vm.password !== vm.confirmPassword) {
        confirmPasswordElement.classList.add('is-invalid');
        confirmPasswordElement.setCustomValidity('Passwords must match.');
        document.getElementById('invalid-password').innerHTML = confirmPasswordElement.validationMessage;
      } else {
        confirmPasswordElement.classList.remove('is-invalid');
        confirmPasswordElement.setCustomValidity('');
      }
    },
    register(username, email, password, confirmPassword) {
      const vm = this;
      axios.post('/api/register', { username, email, password, confirmPassword }, { withCredentials: true })
        .then((_response) => {
          console.log('Registered succesfully');
          vm.resetForm();
          const registerSuccessModal = new Modal(document.getElementById('registerSuccessModal'));
          registerSuccessModal.show();
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            if (error.response.status === 409) {
              if (error.response.data === 'This email is already in use') {
                document.getElementById('email').setCustomValidity(error.response.data);
                document.getElementById('invalid-email').innerHTML = error.response.data;
              }
              if (error.response.data === 'This username is already in use') {
                document.getElementById('username').setCustomValidity(error.response.data);
                document.getElementById('invalid-username').innerHTML = error.response.data;
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
    goToLogin() {
      this.$router.push('/login');
    },
    resetForm() {
      const vm = this;
      const form = document.querySelector('.needs-validation');
      form.classList.remove('was-validated');
      vm.username = '';
      vm.email = '';
      vm.password = '';
      vm.confirmPassword = '';
    },
    handleError(failureMsg) {
      const vm = this;
      vm.error = failureMsg;
      vm.resetForm();
      const registerFailureModal = new Modal(document.getElementById('registerFailureModal'));
      registerFailureModal.show();
    }
  },
};
</script>
