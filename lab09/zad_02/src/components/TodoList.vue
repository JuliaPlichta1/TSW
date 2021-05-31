<template>
    <div class="todolist-container">
        <div class="search">
            <input type="text" v-model="searchText" placeholder="Search..." />
            <button @click="sortElements">Sort</button>
            <button @click="clearSorting">Clear</button>
        </div>
        <div class="display-finished">
            <input type="checkbox" id="display-finished" name="display-finished" :checked="displayFinished" 
                @click="hideDisplayFinished">
            <label  id="display-finished"> Display finished tasks </label>
        </div>
        <div class="todo-list">
            <div v-for="todoElem in searchedElements" :key="todoElem.id" 
                v-show="!todoElem.finished || (todoElem.finished && displayFinished)">
                <TodoElement :todoElement="todoElem" :isAuthenticated="isAuthenticated" @deleteTodo="deleteTodoElement" @toggleTodo="toggleTodoElement"/>
            </div>
        </div>
    </div>
</template>

<script>
import TodoElement from './TodoElement.vue'
export default {
    name: 'TodoList',
    components: { TodoElement },
    props: {
        todoList: Array,
        isAuthenticated: Boolean
    },
    emits: [ "deleteTodo", "toggleTodo", "clearSorting" ],
    data() {
        return {
            searchText: "",
            sorted: false,
            displayFinished: true
        }
    },
    computed: {
        searchedElements() {
            if (this.searchText === "") {
                return this.todoList;
            } else {
                return this.todoList.filter((elem) => elem.title.match(this.searchText));
            }
        }
    },
    methods: {
        deleteTodoElement(todoElem) {
            this.$emit('deleteTodo', todoElem);
        },
        toggleTodoElement(todoElem) {
            this.$emit('toggleTodo', todoElem);
        },
        sortElements() {
            let mTodoList = this.todoList;
            if (this.sorted) {
                mTodoList.reverse();
            } else {
                const compareTitle = (a, b) => (a.title > b.title) ? 1 : ((a.title < b.title) ? -1 : 0)
                mTodoList.sort(compareTitle);
                this.sorted = true;
            }
        },
        clearSorting() {
            this.searchText = "";
            this.sorted = false;
            this.$emit('clearSorting');
        },
        hideDisplayFinished() {
            this.displayFinished = !this.displayFinished;
        }
    }
};
</script>

<style>
.todolist-container {
    max-width: 600px;
    min-width: 400px;
    margin-left: auto;
    margin-right: auto;
    padding: 15px;
}
.todo-list {
    border: 1px solid gray;
}
.search {
    margin-bottom: 5px;
}
.display-finished {
    margin-bottom: 10px;
}
</style>