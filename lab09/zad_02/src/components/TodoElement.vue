<template>
    <div class="todo-element">
        <span class="toggle" @click="toggleTodoElement" :class="{ 'checked': finished }">
            <input type="checkbox" id="todo-elem" name="todo-elem" :checked="finished">
            <label  id="todo-elem"> {{ title }} </label>
        </span>
        <button class="delete" @click="deleteTodoElement">Delete</button>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    name: "TodoElement",
    emits: ["deleteTodoElement", "toggleTodoElement"],
    props: {
        id: Number,
        title: String,
        finished: Boolean
    },
    methods: {
        deleteTodoElement() {
            axios.delete(`/todoElement/${this.id}`)
                .then((response) => {
                    this.$emit('deleteTodoElement', response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        toggleTodoElement() {
            axios.patch(`/todoElement/${this.id}`)
                .then((response) => {
                    this.$emit('toggleTodoElement', response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    },
};
</script>

<style scoped>
.todo-element {
    display: flex;
}
.toggle {
    cursor: pointer;
    padding: 12px 12px 12px 12px;
    flex: 2;
}
.toggle:hover {
    background: #ddd;
}
.toggle.checked {
    text-decoration: line-through;
    background: #888;
    color: #fff;
}
.delete {
    background: royalblue;
    border: none;
    color: white;
    padding: 12px 16px;
    font-size: 16px;
    cursor: pointer;
}
.delete:hover {
    background: dodgerblue;
}
</style>