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
export default {
    name: "AddTodoElement",
    emits: ["addTodo", "editTodo"],
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
            this.$emit('addTodo', todoElem);
            this.title = "";
        },
        editTodoElement() {
            let editedtodoElem = this.selected;
            editedtodoElem.title = this.newTitle;
            this.$emit('editTodo', editedtodoElem);
            this.selected = "";
            this.newTitle = "";
        }
    },
}
</script>