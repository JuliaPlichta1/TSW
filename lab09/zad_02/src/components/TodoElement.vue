<template>
    <div class="todo-element">
        <span class="toggle" @click="toggleTodoElement" :class="{ 'checked': todoElement.finished }">
            <input type="checkbox" id="todo-elem" name="todo-elem" :checked="todoElement.finished">
            <label  id="todo-elem"> {{ todoElement.title }} </label>
        </span>
        <button class="delete" @click="deleteTodoElement">Delete</button>
    </div>
</template>

<script>
export default {
    name: "TodoElement",
    emits: ["deleteTodo", "toggleTodo"],
    props: {
        todoElement: {
            id: Number,
            title: String,
            finished: Boolean 
        }
    },
    methods: {
        deleteTodoElement() {
            this.$emit('deleteTodo', this.todoElement);
        },
        toggleTodoElement() {
            this.$emit('toggleTodo', this.todoElement);
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