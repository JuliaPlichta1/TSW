<template>
  <div class="container mt-2 px-5">
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
export default {
  name: 'Register',
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
        vm.register();
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
    register() {
      // TODO
      console.log('Register');
    }
  },
};
</script>
