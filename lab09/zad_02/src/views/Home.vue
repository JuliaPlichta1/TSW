<template>
    <div class="home-container">
        <h1>Home Page</h1>
        <TodoListShort :todoList="randomTodoList" />
    </div>
</template>

<script>
import TodoListShort from '@/components/TodoListShort.vue';
export default {
    name: 'Home',
    components: { TodoListShort },
    props: {
        todoList: Array
    },
    emits: [ "deleteTodo", "toggleTodo" ],
    computed: {
        randomTodoList: function() {
            let mTodoList = this.todoList;
            mTodoList = mTodoList.filter(elem => !elem.finished);
            this.shuffleArray(mTodoList);
            return mTodoList.slice(0,3);
        }
    },
    methods: {
        deleteTodoElement(todoElem) {
            this.$emit('deleteTodo', todoElem);
        },
        toggleTodoElement(todoElem) {
            this.$emit('toggleTodo', todoElem);
        },
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
    }
};
</script>