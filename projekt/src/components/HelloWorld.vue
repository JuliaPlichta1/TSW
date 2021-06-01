<template>
  <div class="hello">
    <main class="px-3">
      <h1>{{ msg }}</h1>
      <p class="lead">This is an example paragraph.</p>
      <p class="lead">
      <a href="#" class="btn btn-lg btn-dark btn-rounded">Button</a>
      </p>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
