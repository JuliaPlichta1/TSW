<template>
    <div class="login form">
        <h3>Login</h3>
        <input type="text" v-model="username" placeholder="Your username"><br>
        <input type="password" v-model="password" placeholder="Your password" @keyup.enter="login"><br>
        <button @click="login">Login</button>
    </div>
</template>

<script>
export default {
    name: "Login",
    data() {
        return {
            username: "",
            password: ""
        }
    },
    emits: [ "login" ],
    methods: {
        login() {
            if (this.username === "" || this.password === "") {
                alert("Field(s) cannot be empty");
            } else {
                this.$emit('login', this.username, this.password);
                this.username = "";
                this.password = "";
            }
        }
    },

}
</script>