import Vue from 'vue'
import * as LuigiClient from '@luigi-project/client'
import * as firebase from 'firebase/app'
import 'firebase/auth';
import 'firebase/database';;

import './style.scss'

const firebaseConfig = {
  apiKey: "AIzaSyCNiQ3VTATbyL26rkJ6oT2zJH2nVXJZkbo",
  databaseURL: "https://trip-fc58b.firebaseio.com",
  projectId: "trip-fc58b",
  storageBucket: "trip-fc58b.appspot.com",
  messagingSenderId: "720905686784",
  appId: "1:720905686784:web:e7802edf416cde0b832de5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

LuigiClient.addInitListener((context) => {
  const credential = firebase.auth.GoogleAuthProvider.credential(
    context.idToken);

  firebase.auth().signInWithCredential(credential).catch(function (error) {
    console.error(error)
  });
})

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    console.log('user authenticated', user)
    const userId = firebase.auth().currentUser.uid

    const app = startApp(userId)
    listenForDataChange(app, userId)
  }
});


function startApp(userId){
  return new Vue({
    el: '#app',
    created: function () {
      document.getElementById('app').style.display = ''
    },
    data: {
      todos: [],
      newTodo: {
        description: ''
      }
    },
    methods: {
      updateState(todo) {
        database.ref(`users/${userId}/tasks/${todo.id}/isDone`).set(todo.isDone)
      },
      async addNew() {
        const newItem = {
          isDone: false,
          description: this.newTodo.description
        };
        this.todos.push(newItem)
        this.newTodo.description = ''
        database.ref(`users/${userId}/tasks`).push(newItem);
      },
      async remove(todo) {
        database.ref(`users/${userId}/tasks/${todo.id}`).remove();
      },
      uncheckAll() {
        this.todos.forEach(todo => {
          todo.isDone = false
          this.updateState(todo)
        })
      }
    }
  })
}


function listenForDataChange(app, userId) {
  var tasksRef = firebase.database().ref(`users/${userId}/tasks`);

  tasksRef.on('value', function (snapshot) {
    app.$data.todos = []
    snapshot.forEach(item => {
      const todoItem = Object.assign({
        id: item.key
      }, item.val())
      app.$data.todos.push(todoItem)
    })
  })
}
