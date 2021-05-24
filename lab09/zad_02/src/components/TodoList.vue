<template>
    <div class="todolist-container">
        <h1>Welcome!</h1>
        <div v-for="todoElem in todoList" :key="todoElem.id">
            <TodoElement :id="todoElem.id" :title="todoElem.title" :finished="todoElem.finished" 
                @deleteTodoElement="hideElement" @toggleTodoElement="toggleElement"/>
        </div>
        <AddTodoElement :todoList="todoList" @addTodoElement="showElement"/>
    </div>
</template>

<script>
import TodoElement from './TodoElement.vue'
import AddTodoElement from './AddTodoElement.vue';
import axios from 'axios';
export default {
    name: 'TodoList',
    components: { TodoElement, AddTodoElement },
    data() {
        return {
            todoList: []
        }
    },
    methods: {
        getTodoList() {
            axios.get("/todolist")
                .then(response => {
                    this.todoList = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        showElement(todoElem) {
            this.todoList.push(todoElem);
        },
        hideElement(todoElem) {
            const index = this.todoList.findIndex(elem => elem.id === todoElem.id);
            if (index > -1) {
                this.todoList.splice(index, 1);
            }
        },
        toggleElement(todoElem) {
            const index = this.todoList.findIndex(elem => elem.id === todoElem.id);
            if (index > -1) {
                this.todoList[index].finished = todoElem.finished;
            }
        }
    },
    created() {
        this.getTodoList();
    },
}
</script>

<style>
.todolist-container {
    max-width: 600px;
    min-width: 400px;
    margin-left: auto;
    margin-right: auto;
}
</style>