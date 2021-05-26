<template>
    <div class="new-container">
        <h1>Add new task</h1>
        <AddTodoElement :todoList="todoList"
            @addTodo="addTodoElement" 
            @editTodo="editTodoElement" />
    </div>
</template>

<script>
import AddTodoElement from '../components/AddTodoElement.vue';
export default {
    name: 'New',
    emits: ["addTodo", "editTodo"],
    components: { AddTodoElement },
    props: {
        todoList: Array
    },
    methods: {
        addTodoElement(todoElement) {
            this.$emit('addTodo', todoElement);
        },
        editTodoElement(editedtodoElement) {
            this.$emit('editTodo', editedtodoElement);
        }
    }
};
</script>