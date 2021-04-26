<template>
  <div class="addPost">
    <h3>New post</h3>
    <input type="text" v-model="title" />
    <br>
    <input type="text" v-model="body" />
    <br>
    <button @click="addPost">Add post</button>
  </div>
</template>

<script>
export default {
  name: 'Form',
  emits: {
    addPost: ({}) => {
      console.log("addPost");
      return true;
    }
  },
  data() {
    return {
      title: "",
      body: ""
    }
  },
  methods: {
    addPost() {
      let post = { title: this.title, body: this.body }
      this.$emit('addPost', post)
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
