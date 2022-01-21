import React from 'react';
import ReactDOM from 'react-dom';
import SetGame from './SetGame/SetGame';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as serviceWorker from './serviceWorker';

var showSet = true;
try {
  var getConfig = require('./config.js');
} catch(err) {
  console.log(err);
  showSet = false;
}

var dom = (
  <div>
    <h1>
      You don't have the necessary config file to run this application.
      Sorry I didn't want to give you full read/write access to my firebase
      project :p
    </h1>
  </div>
);

if (showSet) {
  var config = getConfig.default();

  // Initialize Firebase
  firebase.initializeApp(config);
  var db = firebase.firestore();
  db.settings({});

  dom = <SetGame db={db} />;
}

ReactDOM.render(dom, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
