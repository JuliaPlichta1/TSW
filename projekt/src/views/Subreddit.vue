<template>
  <div class="container mt-2 px-2 mb-3">
    <h2>r/{{ params.subreddit }}</h2>
    <div v-for="(post, id) in result" :key="id">
      <Post :post="post" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import Post from '../components/Post.vue';

export default {
  components: { Post },
  name: 'Subreddit',
  setup(_props) {
    const params = useRoute().params;
    const result = ref([]);
    const getSubredditData = async() => {
      result.value = await (await axios.get(`/api/subreddit/r/${params.subreddit}`)).data;
    };

    onMounted(getSubredditData);

    return {
      params,
      result,
      getSubredditData,
    };
  },
};
</script>
