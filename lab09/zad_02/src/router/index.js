import { createWebHistory, createRouter } from 'vue-router';
import Home from '@/views/Home';
import Login from '@/views/Login';
import New from '@/views/New';
import List from '@/views/List';
import NotFound from '@/views/NotFound';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/new',
        name: 'New', 
        component: New
    },
    {
        path: '/list',
        name: 'List',
        component: List
    },
    {
        path: "/:catchAll(.*)",
        component: NotFound,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;