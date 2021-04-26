<template>
<div>
  <div v-for="post in posts" :key="post.title">
    <Post :title="post.title" :body="post.body" @deletePost="deletePost"/>
  </div>
  <Form @addPost="showPost"/>
</div>
</template>

<script>
import Form from './Form.vue'
import Post from './Post.vue'
export default {
  components: { Post, Form },
  name: 'Posts',
  data() {
    return {
      posts: [
        { title: "Title1", body: "This is body for title1" },
        { title: "Title2", body: "This is body for title2" },
        { title: "Title3", body: "This is body for title3" },        
      ]
    }
  },
  methods: {
      showPost(post) {
        this.posts.push(post)
      },
      deletePost(postToDelete) {
        //TODO
      }
    }
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
