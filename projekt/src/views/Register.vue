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
      <button type="submit" class="btn btn-primary px-3">Submit</button>
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
      confirmPassword: ''
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
        vm.register(vm.email, vm.password);
      }

      form.classList.add('was-validated');
    },
    checkEmail() {
      const vm = this;
      const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const email = document.getElementById('email');
      if (!emailRegEx.test(vm.email)) {
        email.setCustomValidity('This is not a valid email.');
        document.getElementById('invalid-email').innerHTML = email.validationMessage;
      } else {
        email.setCustomValidity('');
      }
    },
    checkPasswords() {
      const vm = this;
      const confirmPassword = document.getElementById('confirm-password');
      if (vm.password !== vm.confirmPassword) {
        confirmPassword.setCustomValidity('Passwords must match.');
        document.getElementById('invalid-password').innerHTML = confirmPassword.validationMessage;
      } else {
        confirmPassword.setCustomValidity('');
      }
    },
    register(email, password) {
      axios.post('/api/register', { email, password }, { withCredentials: true })
        .then((_response) => {
          console.log('Registered succesfully');
          this.resetForm();
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
              alert('Internal server error');
            }
          } else if (error.request) {
            console.log(error.request);
            alert('No response received fom server');
          } else {
            console.log('Error', error.message);
            alert(error.message);
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
    }
  },
};
</script>
