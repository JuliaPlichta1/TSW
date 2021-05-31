<template>
    <div class="list-container">
        <h1>To-do list</h1>
        <TodoList :todoList="todoList" :isAuthenticated="isAuthenticated"
            @deleteTodo="deleteTodoElement" 
            @toggleTodo="toggleTodoELement" 
            @clearSorting="clearSorting" />
    </div>
</template>

<script>
import TodoList from '@/components/TodoList.vue'
export default {
    name: 'List',
    components: { TodoList },
    props: {
        todoList: Array,
        isAuthenticated: Boolean
    },
    emits: [ "deleteTodo", "toggleTodo", "clearSorting" ],
    methods: {
        deleteTodoElement(todoElem) {
            this.$emit('deleteTodo', todoElem);
        },
        toggleTodoELement(todoElem) {
            this.$emit('toggleTodo', todoElem);
        },
        clearSorting(todoElem) {
            this.$emit('clearSorting', todoElem);
        }
    },
};
</script>