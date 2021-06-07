<template>
  <div class="container mt-2 px-5">
    <h3>Login</h3>
    <form @submit="login">
      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="email" v-model="email" placeholder="name@example.com" required>
        <label for="email">Email address</label>
        <div class="invalid-feedback" id="invalid-email">
          Invalid email or password.
        </div>
      </div>
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password" v-model="password" placeholder="Password" required>
        <label for="password">Password</label>
      </div>
      <button type="submit" class="btn btn-primary px-3">Submit</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    login(event) {
      event.preventDefault();
      document.getElementById('email').classList.add('is-invalid');
      document.getElementById('password').classList.add('is-invalid');
    },
  },
};
</script>
