<template>
  <div class="overflow-auto">
    <div class="d-flex justify-content-between align-items-center">
      <img :src="post.image_path" alt="image" class="img-thumbnail mx-1" style="width: 100px;" v-if="thumbnail">
      <div>
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex mb-1 mx-1 text-small" v-if="!thumbnail">
            <router-link :to="'/r/'+subredditName" class="fw-bold" v-if="withSubredditName">r/{{ subredditName }}</router-link>
            <span class="text-muted ms-1">Posted by u/{{ post.nickname }} {{ time_ago(post.creation_date) }}</span>
          </div>
          <button class="btn btn-sm btn-warning" v-if="userIsModerator">Delete post</button>
        </div>
        <div class="text-start fw-bold mb-1 mx-1">{{ post.title }}</div>
        <div class="text-start my-module mx-1" :id="'post-overflow-'+overflow">
          <div v-html="changeURLsToLinks(post.content)"></div>
        </div>
        <img :src="post.image_path" alt="image" class="my-2" style="width: 250px;" v-if="!thumbnail">
        <div class="text-start mb-1 ms-1 text-small" v-if="thumbnail">
          <router-link :to="'/r/'+subredditName" class="fw-bold" v-if="withSubredditName">r/{{ subredditName }}</router-link>
          <span class="text-muted ms-1">Posted by u/{{ post.nickname }} {{ time_ago(post.creation_date) }}</span>
        </div>
        <div class="ratio ratio-16x9" v-if="!thumbnail && post.video_url">
          <iframe :src="post.video_url.replace('watch?v=', 'embed/')" title="YouTube video" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Post',
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
