<template>
  <div class="container-sm mt-3 mb-3" v-if="dataLoaded">
    <div class="d-flex justify-content-center">
      <div>
        <Post :post="post" :subredditName="subreddit.name"
          :withSubredditName="true" :overflow="false" :thumbnail="false"
          :userIsModerator="subreddit.moderator" class="list-group-item"/>
        <div v-for="(comment, id) in comments" :key="id">
          <div class="list-group list-group-item">
            <div class="comment">
              <div class="text-start">
                <div class="d-flex flex-row justify-content-between align-items-center">
                  <div class="fw-bold me-2">
                    u/{{ comment.nickname }}
                  </div>
                  <button class="btn btn-sm btn-warning" v-if="subreddit.moderator">Delete</button>
                </div>
                <div class="text-start">
                  {{ comment.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import Post from '../components/Post.vue';

export default {
  components: { Post },
  name: 'Comments',
  setup(_props) {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const subreddit = ref({});
    const post = ref({});
    const comments = ref([]);
    const dataLoaded = ref(false);

    const getSubredditPostComments = async() => {
      try {
        const result = await (await axios.get(`/api/subreddit/r/${route.params.subreddit}/comments/${route.params.postId}`)).data;
        subreddit.value = result.subreddit;
        post.value = result.post;
        comments.value = result.comments;

        if (store.getters.user && store.getters.userSubreddits) {
          if (store.getters.userSubreddits.some(e => e.id === subreddit.value.id)) {
            subreddit.value.userJoined = true;
          } else {
            subreddit.value.userJoined = false;
          }
        }
        if (store.getters.user && store.getters.moderatedSubreddits) {
          if (store.getters.moderatedSubreddits.some(e => e.id === subreddit.value.id)) {
            subreddit.value.moderator = true;
          } else {
            subreddit.value.moderator = false;
          }
        }
        dataLoaded.value = true;
      } catch (error) {
        if (error.response) {
          console.log(error.response);
        }
        router.replace({
          name: 'NotFound',
          params: { catchAll: route.path.substring(1).split('/') }
        });
      }
    };

    onMounted(getSubredditPostComments);

    return {
      post,
      subreddit,
      comments,
      dataLoaded,
      getSubredditPostComments,
    };
  },
};
</script>
