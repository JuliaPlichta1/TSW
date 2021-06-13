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
    <form @submit="submit" class="needs-validation" novalidate>
      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="email" v-model="email" @change="checkEmail" placeholder="name@example.com" required>
        <label for="email">Email address</label>
        <div class="invalid-feedback" id="invalid-email">
          This is not a valid email address.
        </div>
      </div>
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password" v-model="password" @change="checkPasswords" placeholder="Password" required>
        <label for="password">Password</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="confirm-password" v-model="confirmPassword" @change="checkPasswords" placeholder="Confirm password" required>
        <label for="confirm-password">Confirm password</label>
        <div class="invalid-feedback" id="invalid-password">
          Please confirm password.
        </div>
      </div>
      <button type="submit" class="btn btn-primary px-4">Submit</button>
    </form>
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
        vm.register(vm.email, vm.password, vm.confirmPassword);
      }
      form.classList.add('was-validated');
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
    register(email, password, confirmPassword) {
      const vm = this;
      axios.post('/api/register', { email, password, confirmPassword }, { withCredentials: true })
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
              document.getElementById('email').setCustomValidity(error.response.data);
              document.getElementById('invalid-email').innerHTML = error.response.data;
            }
            if (error.response.status === 500) {
              const failureMsg = 'Internal server error.';
              vm.handleError(failureMsg);
            }
          } else if (error.request) {
            const failureMsg = 'No response received from server.';
            vm.handleError(failureMsg);
          } else {
            const failureMsg = `Error: ${error.message}`;
            vm.handleError(failureMsg);
          }
        });
    },
    goToLogin() {
      this.$router.push('/login');
    },
    resetForm() {
      const form = document.querySelector('.needs-validation');
      form.classList.remove('was-validated');
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
    },
    handleError(failureMsg) {
      this.error = failureMsg;
      console.log(failureMsg);
      this.resetForm();
      const registerFailureModal = new Modal(document.getElementById('registerFailureModal'));
      registerFailureModal.show();
    }
  },
};
</script>
