import React, { Component } from 'react';
import SignInUp from '../SignInUp/SignInUp';
import Dashboard from '../Dashboard/Dashboard';
import TitleScreen from '../TitleScreen/TitleScreen';
import GameBoard from '../GameBoard/GameBoard';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';

export default class SetGame extends Component {
  constructor() {
    super();

    this.state = {
      toRender: "TitleScreen"
    }
  }

  componentDidMount() {
    const auth = getAuth(this.props.firebaseApp);
    onAuthStateChanged(auth, async function(user) {
      if (user) {
        // User is signed in.
        const db = getFirestore(this.props.firebaseApp);
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        let gameId = '';
        if (userDoc.exists()) gameId = userDoc.data().currentGame;

        this.setState({
          toRender: "Dashboard",
          uid: user.uid,
          gameId
        });
      } else {
        // No user is signed in.
        this.setState({toRender: "SignInUp"});
      }
    }.bind(this));
  }

  render() {
    if (this.state.toRender === "Dashboard") {
      return (
        <Dashboard
          changeView={this.changeToRender}
          gameId={this.state.gameId}
          setGameId={this.setGameId}
          firebaseApp={this.props.firebaseApp}
        />
      );
    } else if (this.state.toRender === "SignInUp") {
      return <SignInUp firebaseApp={this.props.firebaseApp} />;
    } else if (this.state.toRender === "GameBoard") {
      return (
        <GameBoard
          uid={this.state.uid}
          firebaseApp={this.props.firebaseApp}
          changeView={this.changeToRender}
        />
      );
    }
    return <TitleScreen message="Loading" />;
  }

  setGameId = (newId) => {
    var obj = {};
    obj.gameId = newId;
    obj.toRender = "GameBoard";
    const db = getFirestore(this.props.firebaseApp);
    const userRef = doc(db, 'users', this.state.uid);
    updateDoc(userRef, {
      currentGame: newId,
      numSets: 0
    });
    this.setState(obj);
  }

  changeToRender = (changeKey) => {
    var tempState = {};
    tempState.toRender = changeKey;
    this.setState(tempState);
  }
}