import Vue from 'vue'
import * as axios from 'axios'
import * as LuigiClient from '@kyma-project/luigi-client'
import * as firebase from 'firebase';
import * as uuid from 'uuid/v4';

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
let userId = ''


LuigiClient.addInitListener((context) => {
  var credential = firebase.auth.GoogleAuthProvider.credential(
    context.idToken);

  firebase.auth().signInWithCredential(credential).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
})




const app = new Vue({
  el: '#app',
  created: function(){
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
      database.ref(`users/${userId}/tasks/${todo.uuid}/isDone`).set(todo.isDone)
    },
    async addNew() {
      const newItem = {
        isDone: false,
        description: this.newTodo.description
      };
      this.todos.push(newItem)
      this.newTodo.description = ''
      database.ref(`users/${userId}/tasks/${uuid()}`).set(newItem);
    },
    async remove(todo){
      database.ref(`users/${userId}/tasks/${todo.uuid}`).remove(); 
    }
  }
})


firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    console.log('user authenticated', user)
    userId = firebase.auth().currentUser.uid

    var tasksRef = firebase.database().ref(`users/${userId}/tasks`);
    tasksRef.on('value', function (snapshot) {
      console.log('data changed', snapshot.val())
      app.$data.todos.length = 0
      const value = snapshot.val()
      Object.keys(value).forEach(key => 
        app.$data.todos.push(Object.assign({uuid: key},value[key])))
    });

  }
});