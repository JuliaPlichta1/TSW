<template>
    <div class="todolist-container">
        <h1>Welcome!</h1>
        <div class="search">
            <input type="text" v-model="searchText" @keyup.enter="searchElements" />
            <button @click="searchElements">Search</button>
            <button @click="sortElements">Sort</button>
            <button @click="getTodoList">Clear</button>
        </div>
        <div class="display-finished">
            <input type="checkbox" id="display-finished" name="display-finished" :checked="displayFinished" 
                @click="hideDisplayFinished">
            <label  id="display-finished"> Display finished tasks </label>
        </div>
        <div v-for="todoElem in todoList" :key="todoElem.id" 
            v-show="!todoElem.finished || (todoElem.finished && displayFinished)">
            <TodoElement :id="todoElem.id" :title="todoElem.title" :finished="todoElem.finished" 
                @deleteTodoElement="deleteElement" @toggleTodoElement="toggleElement"/>
        </div>
        <AddTodoElement :todoList="todoList" @addTodoElement="addElement"/>
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
            todoList: [],
            searchText: "",
            sortedASC: false,
            displayFinished: true
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
            this.sortedASC = false;
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
        },
        async searchElements() {
            await this.getTodoList();
            this.todoList = this.todoList.filter(elem => elem.title.match(this.searchText));
        },
        sortElements() {
            if (this.sortedASC) {
                this.todoList.reverse();
            } else {
                const compareTitle = (a, b) => (a.title > b.title) ? 1 : ((a.title < b.title) ? -1 : 0)
                this.todoList = this.todoList.sort(compareTitle);
                this.sortedASC = true;
            }
        },
        hideDisplayFinished() {
            this.displayFinished = !this.displayFinished;
        }
    },
    async created() {
        await this.getTodoList();
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
.search {
    margin-bottom: 5px;
}
.display-finished {
    margin-bottom: 10px;
}
</style>