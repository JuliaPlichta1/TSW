<template>
    <div class="home-container">
        <h1>Home Page</h1>
        <TodoListShort/>
    </div>
</template>

<script>
import TodoListShort from '@/components/TodoListShort.vue';
export default {
    name: 'Home',
    components: { TodoListShort },
};
</script>