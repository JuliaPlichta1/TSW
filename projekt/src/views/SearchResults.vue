<template>
  <div class="container mt-2 px-2 mb-3">
    <div class="text-start">
      <p class="fs-4 fw-bold mb-1">{{ query.q }}</p>
      <p class="text-muted">search result</p>
    </div>
    <p class="fs-6 fw-bold mb-1">{{ query.t }}</p>
    <div v-if="isEmptyResult">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="orange" class="bi bi-emoji-frown" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
      </svg>
      <p>
        Ups! There are no results for
        <span class="fw-bold">"{{ query.q }}"</span>
      </p>
    </div>
    <div v-if="query.t === 'subreddits'">
      <div class="row" v-for="(subreddit, id) in result" :key="id">
        <div class="list-group overflow-auto list-group-item">
          <router-link :to="'/r/'+subreddit.name" class="list-group-item-action">
            <div class="d-flex justify-content-between align-items-center text-start">
              <div class="fw-bold mb-1 mx-1">r/{{ subreddit.name }}</div>
              <div class="mb-1 mx-1">{{ subreddit.description }} </div>
              <button class="badge bg-primary rounded-pill px-3 mx-1">Join</button>
            </div>
          </router-link>
        </div>
      </div>
    </div>
    <div v-else-if="query.t === 'posts'">
      <div v-for="(post, id) in result" :key="id">
        <Post :post="post" :withSubredditName="true"/>
      </div>
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
  name: 'SearchResults',
  setup(_props) {
    const query = useRoute().query;
    const result = ref([]);
    const isEmptyResult = ref(false);
    const search = async() => {
      result.value = await (await axios.get(`/api/subreddit/search?q=${query.q}&type=${query.t}`)).data;
      if (result.value.length === 0) {
        isEmptyResult.value = true;
      }
    };

    onMounted(search);

    return { query, result, isEmptyResult, search };
  },
};
</script>
