<template>
    <div class="todolist-container">
        <div class="todo-list">
            <div v-for="todoElem in todoList" :key="todoElem.id">
                <TodoElement :todoElement="todoElem" :isAuthenticated="isAuthenticated" @deleteTodo="deleteTodoElement" @toggleTodo="toggleTodoElement"/>
            </div>
        </div>
    </div>
</template>

<script>
import TodoElement from './TodoElement.vue'
export default {
    name: 'TodoListShort',
    components: { TodoElement },
    props: {
        todoList: Array,
        isAuthenticated: Boolean
    },
    emits: [ "deleteTodo", "toggleTodo" ],
    methods: {
        deleteTodoElement(todoElem) {
            this.$emit('deleteTodo', todoElem);
        },
        toggleTodoElement(todoElem) {
            this.$emit('toggleTodo', todoElem);
        }
    },
};
</script>