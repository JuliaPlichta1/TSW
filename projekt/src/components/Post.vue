<template>
  <div class="overflow-auto" v-if="dataLoaded">
    <div class="d-flex justify-content-between">
      <div class="my-2 me-2">
        <div class="votes d-flex flex-column">
          <button v-if="postUserVote === 0 || postUserVote === -1" class="btn btn-sm btn-outline-secondary" @click="voteUp">+</button>
          <button v-if="postUserVote === 1" class="btn btn-sm btn-secondary" @click="voteZero">+</button>
          <small>{{ post.votes_result }}</small>
          <button v-if="postUserVote === 0 || postUserVote === 1" class="btn btn-sm btn-outline-secondary" @click="voteDown">-</button>
          <button v-if="postUserVote === -1" class="btn btn-sm btn-secondary" @click="voteZero">-</button>
        </div>
      </div>
      <img :src="post.image_path" alt="no image" class="img-thumbnail mx-1" style="width: 100px;" v-if="thumbnail">
      <div class="d-flex flex-column justify-content-between align-items-center w-100">
        <div class="w-100">
          <div class="d-flex justify-content-between mb-1 text-small" v-if="!thumbnail">
            <div>
              <router-link :to="'/r/'+subredditName" class="fw-bold me-1" v-if="withSubredditName">r/{{ subredditName }}</router-link>
              <span class="text-muted">Posted by u/{{ post.nickname }} {{ time_ago(post.creation_date) }}</span>
            </div>
            <button class="btn btn-sm btn-warning ms-2" v-if="userIsModerator" @click="confirmDelete">Delete post</button>
          </div>
        </div>
        <div class="w-100">
          <div class="text-start fw-bold mb-1">{{ post.title }}</div>
        </div>
        <div class="text-start my-module mx-1 w-100" :id="'post-overflow-'+overflow">
          <div v-html="changeURLsToLinks(post.content)"></div>
        </div>
        <img :src="post.image_path" class="my-2 w-75" v-if="!thumbnail">
        <div class="w-100">
          <div class="text-start mb-1 ms-1 text-small" v-if="thumbnail">
            <router-link :to="'/r/'+subredditName" class="fw-bold" v-if="withSubredditName">r/{{ subredditName }}</router-link>
            <span class="text-muted ms-1">Posted by u/{{ post.nickname }} {{ time_ago(post.creation_date) }}</span>
          </div>
        </div>
        <div class="ratio ratio-16x9 w-75" v-if="!thumbnail && post.video_url">
          <iframe :src="post.video_url.replace('watch?v=', 'embed/')" title="YouTube video" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, _computed } from 'vue';

export default {
  name: 'Post',
  emits: ['openConfirmDeleteModal', 'vote'],
  data() {
    return {
      error: null,
    };
  },
  props: {
    post: Object,
    subredditName: String,
    withSubredditName: {
      type: Boolean,
      default: false
    },
    overflow: {
      type: Boolean,
      default: true
    },
    thumbnail: {
      type: Boolean,
      default: true
    },
    userIsModerator: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const postUserVote = ref({});
    const dataLoaded = ref(false);

    const checkUserVote = async() => {
      axios.get(`/api/user/vote/${props.post.id}`)
        .then((response) => {
          postUserVote.value = response.data.vote;
          dataLoaded.value = true;
        })
        .catch((error) => {
          console.log(error);
        });
    };

    onMounted(checkUserVote);

    return {
      dataLoaded,
      postUserVote,
      checkUserVote,
    };
  },
  methods: {
    time_ago(time) {
      switch (typeof time) {
        case 'number':
          break;
        case 'string':
          time = +new Date(time);
          break;
        case 'object':
          if (time.constructor === Date) time = time.getTime();
          break;
        default:
          time = +new Date();
      }
      const timeFormats = [
        [60, 'seconds', 1], // 60
        [120, '1 minute ago', '1 minute from now'], // 60*2
        [3600, 'minutes', 60], // 60*60, 60
        [7200, '1 hour ago', '1 hour from now'], // 60*60*2
        [86400, 'hours', 3600], // 60*60*24, 60*60
        [172800, 'yesterday', 'tomorrow'], // 60*60*24*2
        [604800, 'days', 86400], // 60*60*24*7, 60*60*24
        [1209600, 'last week', 'next week'], // 60*60*24*7*4*2
        [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
        [4838400, 'last month', 'next month'], // 60*60*24*7*4*2
        [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
        [58060800, 'last year', 'next year'], // 60*60*24*7*4*12*2
        [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
        [5806080000, 'last century', 'next century'], // 60*60*24*7*4*12*100*2
        [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
      ];
      let seconds = (+new Date() - time) / 1000;
      let token = 'ago';
      let listChoice = 1;

      if (seconds === 0) {
        return 'Just now';
      }
      if (seconds < 0) {
        seconds = Math.abs(seconds);
        token = 'from now';
        listChoice = 2;
      }
      let i = 0;
      let format;
      // eslint-disable-next-line no-cond-assign
      while (format = timeFormats[i++]) {
        if (seconds < format[0]) {
          if (typeof format[2] === 'string') {
            return format[listChoice];
          } else {
            return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
          }
        }
      }
      return time;
    },
    changeURLsToLinks(inputText) {
      let replacedText;

      // URLs starting with http://, https://, or ftp://
      const pattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim;
      replacedText = inputText.replace(pattern1, '<a href="$1" target="_blank">$1</a>');

      // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
      const pattern2 = /(^|[^/])(www\.[\S]+(\b|$))/gim;
      replacedText = replacedText.replace(pattern2, '$1<a href="http://$2" target="_blank">$2</a>');

      // Change email addresses to mailto:: links.
      const pattern3 = /(([a-zA-Z0-9\-_.])+@[a-zA-Z_]+?(\.[a-zA-Z]{2,6})+)/gim;
      replacedText = replacedText.replace(pattern3, '<a href="mailto:$1">$1</a>');

      return replacedText;
    },
    confirmDelete(event) {
      event.preventDefault();
      const vm = this;
      vm.$emit('openConfirmDeleteModal', { subredditName: vm.subredditName, postId: vm.post.id });
    },
    voteUp(event) {
      event.preventDefault();
      const vm = this;
      vm.postUserVote = 1;
      vm.$emit('vote', { postId: vm.post.id, vote: 1 });
    },
    voteDown(event) {
      event.preventDefault();
      const vm = this;
      vm.postUserVote = -1;
      vm.$emit('vote', { postId: vm.post.id, vote: -1 });
    },
    voteZero(event) {
      event.preventDefault();
      const vm = this;
      vm.postUserVote = 0;
      vm.$emit('vote', { postId: vm.post.id, vote: 0 });
    }
  },
};
</script>

<style scoped>
.my-module {
  overflow: hidden;
  font: 1em/1em 'Open Sans', sans-serif;
}
#post-overflow-true {
  position: relative;
  height: 3em;
}
#post-overflow-true:after {
  content: "";
  text-align: right;
  position: absolute;
  bottom: 0;
  right: 0;
  width: 70%;
  height: 1em;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%);
}
.text-small {
  font-size: 0.77em;
}
</style>
