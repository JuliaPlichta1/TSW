<template>
  <div class="post">
    <h4 class="title">
      {{ title }}
    </h4>
    {{ body }}
    <br>
    <button @click="deletePost">Delete</button>
  </div>
</template>

<script>
export default {
  name: 'Post',
  emits: {
    deletePost: () => {
      console.log("delete post")
      return true
    }
  },
  props: {
    title: "",
    body: ""
  },
  methods: {
    deletePost() {
      let post = { title: this.title, body: this.body }
      this.$emit('deletePost', post)
    }
  },
}
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
