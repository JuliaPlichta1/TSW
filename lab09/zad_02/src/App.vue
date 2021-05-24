<template>
  <div class="app-container">
    <div class="nav">
      <router-link to="/"><button class="router-button">Home</button></router-link>
      <router-link to="/new"><button class="router-button">Add new task</button></router-link>
      <router-link to="/list"><button class="router-button">All tasks</button></router-link>
    </div>
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App',
}
</script>

<style>
body {
  margin: 0px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
.nav {
  margin-bottom: 15px;
  background: lightblue;
}
.router-button {
  margin: 10px 10px;
  padding: 10px 20px;
  border: none;
}
</style>
