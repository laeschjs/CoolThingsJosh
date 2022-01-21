import React from 'react';
import ReactDOM from 'react-dom';
import SetGame from './SetGame/SetGame';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { initializeApp } from 'firebase/app';
import * as serviceWorker from './serviceWorker';

// Won't exist for people who clone
import { firebaseSecret } from './config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseSecret);
firebase.initializeApp(firebaseSecret);
var db = firebase.firestore();
db.settings({});

ReactDOM.render(<SetGame db={db} firebaseApp={firebaseApp} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
