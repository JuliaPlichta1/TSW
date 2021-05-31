<template>
  <div class="app-container">
    <div class="nav">
      <router-link to="/"><button class="router-button">Home</button></router-link>
      <router-link to="/new" v-if="isAuthenticated"><button class="router-button">Add new task</button></router-link>
      <router-link to="/list" v-if="isAuthenticated"><button class="router-button">All tasks</button></router-link>
      <router-link to="/login" v-if="!isAuthenticated"><button class="router-button">Login</button></router-link>
      <span v-if="isAuthenticated"><button @click="logout" class="router-button">Logout</button></span>
    </div>
    <router-view v-if="dataLoaded" :todoList="todoList" :isAuthenticated="isAuthenticated" :username="user.username"
        @addTodo="addTodoElement" @editTodo="editTodoElement"
        @deleteTodo="deleteTodoElement" @toggleTodo="toggleTodoElement"
        @clearSorting="getTodoList" @login="login" @logout="logout" />
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
            dataLoaded: false,
            isAuthenticated: false,
            user: {}
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
        },
        login(username, password) {
            axios.post("/login", { username, password })
                .then((response) => {
                    this.isAuthenticated = response.data.isAuthenticated;
                    this.user = response.data.user;
                    this.$router.push('/');
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        async logout() {
            axios.get("/logout")
                .then(() => {
                    this.$router.push("/");
                })
                .catch((error) => {
                    console.log(error);
                });
                await this.getUser();
        },
        async getUser() {
            await axios.get("/user")
                .then((response) => {
                    this.isAuthenticated = response.data.isAuthenticated;
                    if (response.data.user) {
                        this.user = response.data.user;
                    } else {
                        this.user = {};
                    }
                });
        }
    },
    created() {
        const port = process.env.PORT || 5000;
        this.socket = io(`http://localhost:${port}`);
    },
    async mounted() {
        await this.getTodoList();
        await this.getUser();
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
