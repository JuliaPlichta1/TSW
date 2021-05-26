<template>
  <div class="app-container">
    <div class="nav">
      <router-link to="/"><button class="router-button">Home</button></router-link>
      <router-link to="/new"><button class="router-button">Add new task</button></router-link>
      <router-link to="/list"><button class="router-button">All tasks</button></router-link>
    </div>
    <router-view v-if="dataLoaded" :todoList="todoList" 
        @addTodo="addTodoElement" @editTodo="editTodoElement"
        @deleteTodo="deleteTodoElement" @toggleTodo="toggleTodoElement"
        @clearSorting="getTodoList" />
  </div>
</template>

<script>
import io from 'socket.io-client';
import axios from 'axios';
export default {
    name: 'App',
    data() {
        return {
            socket: {},
            todoList: [],
            dataLoaded: false
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
        addTodoElement(todoElement) {
            axios.post("/todoElement", todoElement)
                .then((response) => {
                    this.socket.emit('addedTodoElement', response.data);
                    this.$router.push('/list');
                })
                .catch((error) => {
                    alert("Something went wrong :(");
                    console.log(error);
                });
        }, 
        editTodoElement(editedTodoElement) {
            axios.put(`/todoElement/${editedTodoElement.id}`, editedTodoElement)
                .then((response) => {
                    this.socket.emit('editedTodoElement', response.data);
                    this.$router.push('/list');
                })
                .catch((error) => {
                    alert("Something went wrong :(");
                    console.log(error);
                });
        },
        deleteTodoElement(todoElement) {
            axios.delete(`/todoElement/${todoElement.id}`)
                .then((response) => {
                    this.socket.emit('deletedTodoElement', response.data);
                    // const index = this.todoList.findIndex(elem => elem.id === todoElem.id);
                    // if (index > -1) {
                    //     this.todoList.splice(index, 1);
                    // }
                })
                .catch((error) => {
                    alert("Something went wrong :(");
                    console.log(error);
                });
        },
        toggleTodoElement(todoElement) {
            axios.patch(`/todoElement/${todoElement.id}`)
                .then((response) => {
                    this.socket.emit('toggledTodoElement', response.data);
                    // const index = this.todoList.findIndex(elem => elem.id === todoElem.id);
                    // if (index > -1) {
                    //     this.todoList[index].finished = todoElem.finished;
                    // }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    },
    created() {
        const port = process.env.PORT || 5000;
        this.socket = io(`http://localhost:${port}`);
    },
    async mounted() {
        await this.getTodoList();
        this.dataLoaded = true;
        
        this.socket.on('todoElementAdded', async (todoElement) => {
            console.log('[SOCKET]: Added Todo Element: ', todoElement);
            await this.getTodoList();
        });
        this.socket.on('todoElementEdited', async (todoElement) => {
            console.log('[SOCKET]: Edited Todo Element: ', todoElement);
            await this.getTodoList();
        });
        this.socket.on('todoElementDeleted', async (todoElement) => {
            console.log('[SOCKET]: Deleted Todo Element: ', todoElement);
            await this.getTodoList();
        });
        this.socket.on('todoElementToggled', async (todoElement) => {
            console.log('[SOCKET]: Toggled Todo Element: ', todoElement);
            await this.getTodoList();
        });
    },
}
</script>

<style>
body {
  margin: 0px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}
.nav {
  margin-bottom: 15px;
  background: lightblue;
}
.router-button {
  margin: 10px 10px;
  padding: 10px 20px;
  border: none;
}
</style>
