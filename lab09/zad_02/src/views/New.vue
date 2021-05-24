<template>
    <div class="new-container">
        <h1>Add new task</h1>
        <AddTodoElement :todoList="todoList" @addTodoElement="redirectToList"/>
    </div>
</template>

<script>
import axios from 'axios';
import AddTodoElement from '../components/AddTodoElement.vue';
export default {
    name: 'New',
    components: { AddTodoElement },
    data() {
        return {
            todoList: []
        }
    },
    methods: {
        async getTodoList() {
            await axios.get("/todolist")
                .then(response => {
                    this.todoList = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        redirectToList() {
            this.$router.push('/list');
        }
    },
    async created() {
        await this.getTodoList();
    },
};
</script>