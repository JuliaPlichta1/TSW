<template>
  <div v-if="dataLoaded">
    <div class="container mt-2 px-2 mb-3">
      <div class="d-flex justify-content-center">
        <div style="width: 40rem">
          <div class="list-group-item">
            <Post :post="post" :subredditName="subreddit.name"
              :withSubredditName="true" :overflow="false" :thumbnail="false"
              :userIsModerator="subreddit.moderator" @vote="vote"
              @openConfirmDeleteModal="openConfirmDeleteModal" />
            <div class="new-comment" v-if="isAuth">
              <div class="w-100 mt-2 d-flex justify-content-start">
                <small class="text-muted">Comment as u/{{ user.nickname }}</small>
              </div>
              <div class="w-100 mb-2" >
                <textarea class="form-control" name="new-comment" id="new-comment"
                  placeholder="What do you think?" v-model="newComment" rows="3" maxlength="255"></textarea>
                <button class="btn btn-primary px-4 mt-2" @click="addComment" :disabled="!newComment">Comment</button>
              </div>
            </div>
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
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import Post from '../components/Post.vue';

export default {
  components: { Post },
  emits: ['openConfirmDeleteModal'],
  name: 'Comments',
  data() {
    return {
      newComment: null
    };
  },
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

    const updatePostVoteResult = async() => {
      const data = await (await axios.get(`/api/subreddit/votes/${post.value.id}`)).data;
      post.value.votes_result = data.votes_result;
    };

    onMounted(getSubredditPostComments);

    return {
      post,
      subreddit,
      comments,
      dataLoaded,
      getSubredditPostComments,
      updatePostVoteResult,
      isAuth: computed(() => store.getters.isAuth),
      user: computed(() => store.getters.user),
    };
  },
  methods: {
    openConfirmDeleteModal(data) {
      const vm = this;
      vm.$emit('openConfirmDeleteModal', data);
    },
    vote(data) {
      axios.post(`/api/user/vote/${data.postId}`, { vote: data.vote })
        .then((_response) => {
          this.updatePostVoteResult();
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    },
  },
};
</script>
