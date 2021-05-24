<template>
    <div class="todolist-container">
        <div class="todo-list">
            <div v-for="todoElem in todoList" :key="todoElem.id">
                <TodoElement :id="todoElem.id" :title="todoElem.title" :finished="todoElem.finished" 
                    @deleteTodoElement="deleteElement" @toggleTodoElement="toggleElement"/>
            </div>
        </div>
    </div>
</template>

<script>
import TodoElement from './TodoElement.vue'
import axios from 'axios';
export default {
    name: 'TodoListShort',
    components: { TodoElement },
    data() {
        return {
            todoList: []
        }
    },
    methods: {
        async getTodoList() {
            await axios.get("/todolist")
                .then(response => {
                    const todoList = response.data;
                    let newTodoList = todoList.filter(elem => elem.finished === false);
                    const shuffledNewTodoList = newTodoList.sort(() => 0.5 - Math.random());
                    this.todoList = shuffledNewTodoList.slice(0,3);
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        addElement(todoElem) {
            this.todoList.push(todoElem);
        },
        deleteElement(todoElem) {
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
    async created() {
        await this.getTodoList();
    },
};
</script>