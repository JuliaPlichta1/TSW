<template>
    <div class="addTodoElement">
        <h3>New Todo element</h3>
        <input type="text" v-model="title" @keyup.enter="addTodoElement" />
        <button @click="addTodoElement">Add</button>
        <h3>Edit Todo element</h3>
        <select v-model="selected">
            <option v-for="todoElem in todoList" :key="todoElem.id" v-bind:value="todoElem">
                {{ todoElem.title }}
            </option>
        </select><br>
        <input type="text" @keyup.enter="editTodoElement" v-model="newTitle" />
        <button @click="editTodoElement">Edit</button>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    name: "AddTodoElement",
    emits: ["addTodoElement"],
    props: {
        todoList: Array
    },
    data() {
        return {
            title: "",
            selected: "",
            newTitle: ""
        }
    },
    methods: {
        addTodoElement() {
            const todoElem = { title: this.title, finished: false };
            axios.post("/todoElement", todoElem)
                .then((response) => {
                    this.$emit('addTodoElement', response.data);
                    this.title = "";
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        editTodoElement() {
            let editedTodoElement = this.selected;
            editedTodoElement.title = this.newTitle;
            axios.put(`/todoElement/${this.selected.id}`, editedTodoElement)
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.log(error);
                });
            this.selected = "";
            this.newTitle = "";
        }
    },
}
</script>