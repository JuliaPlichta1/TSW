<template>
  <div class="list-group overflow-auto list-group-item ">
    <router-link :to="'/r/'+post.name+'/comments/'+post.id" class="list-group-item-action">
      <div class="d-flex justify-content-between align-items-center">
        <img :src="post.image_path" alt="image" class="img-thumbnail mx-1 " style="width: 100px;">
        <div class="text-start">
          <div class="fw-bold mb-1 mx-1">{{ post.title }}</div>
          <div class="d-flex flex-column justify-content-start text-start my-module">
            <div class="mx-1" id="post-content">{{ post.content }} </div>
          </div>
          <small class="d-flex flex-column justify-content-start text-start">
            <small class="mb-1 mx-1">
              <router-link :to="'/r/'+post.name" class="fw-bold" v-if="withSubredditName">
                r/{{ post.name }}
              </router-link>
              <span class="text-muted">
              Posted by u/{{ post.nickname }} {{ time_ago(post.creation_date) }}
              </span>
            </small>
          </small>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'Post',
  props: {
    post: Object,
    withSubredditName: {
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
    }
  },
};
</script>

<style scoped>
.my-module {
  margin: 0 0 1em 0;
  overflow: hidden;
  font: 1em/1em 'Open Sans', sans-serif;
}
#post-content {
  position: relative;
  height: 4em;
}
#post-content:after {
  content: "";
  text-align: right;
  position: absolute;
  bottom: 0;
  right: 0;
  width: 70%;
  height: 1em;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%);
}
</style>
