My favorite card game we played in college made on the web to be able to keep playing with friends no matter where we live.
[https://coolthingsjosh.web.app](https://coolthingsjosh.web.app)

## Firebase

The project uses firebase for hosting, authentication, firestore realtime db, and storage of static assets.
In order to run this app locally and deploy, you need to have the [Firebase CLI](https://firebase.google.com/docs/cli) installed via npm.
In order for the Firebase CLI to work, you need to have a `config.js` in the src directory containing the secrets needed to connect to the Firebase console. That file was purposefully .gitignored to prevent everyone to have access to my Firebase console.

## Available Scripts

### `npm run start`

First will build the app and output it to the build folder.<br>
Then will run firebase serve for you to test the changes locally at [http://localhost:5000](http://localhost:5000) while still being connected to firebase.

## Create React App

This project was bootstrapped with [Create React App](https://github.com/laeschjs/CoolThingsJosh/tree/master/create_react_app/).
