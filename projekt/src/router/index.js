import { createWebHistory, createRouter } from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import SearchResults from '@/views/SearchResults';
import Subreddit from '@/views/Subreddit';
import Comments from '@/views/Comments';
import Userboard from '@/views/Userboard';
import NotFound from '@/views/NotFound';
import Login from '@/views/Login';
import Register from '@/views/Register';

import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HelloWorld
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: SearchResults,
    beforeEnter: (to, from, next) => {
      if (!to.query.q || !to.query.t || (to.query.t !== 'subreddits' && to.query.t !== 'posts')) {
        next({
          name: 'NotFound',
          params: { catchAll: to.path.substring(1).split('/') },
          query: to.query
        });
      } else {
        next();
      }
    }
  },
  {
    path: '/r/:subreddit',
    name: 'Subreddit',
    component: Subreddit
  },
  {
    path: '/r/:subreddit/comments/:postId',
    name: 'Comments',
    component: Comments
  },
  {
    path: '/userboard',
    name: 'Userboard',
    component: Userboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/logout',
    name: 'Logout',
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/:catchAll(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    if (store.getters.isAuth) {
      if (to.name === 'Logout') {
        store.dispatch('logout');
        next({ name: 'Login' });
      } else next();
    } else {
      next({ name: 'Login' });
    }
  } else next();
});

export default router;
