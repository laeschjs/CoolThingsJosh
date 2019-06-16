import React, { Component } from 'react';
import SignInUp from '../SignInUp/SignInUp';
import Dashboard from '../Dashboard/Dashboard';
import TitleScreen from '../TitleScreen/TitleScreen';
import GameBoard from '../GameBoard/GameBoard';
import firebase from 'firebase/app';
import 'firebase/auth';

export default class SetGame extends Component {
  constructor() {
    super();

    this.state = {
      toRender: "TitleScreen"
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var userRef = this.props.db.doc("users/" + user.uid);
        userRef.get().then(function(userDoc) {
          this.setState({
            toRender: "Dashboard",
            uid: user.uid,
            gameId: userDoc.data().currentGame
          });
        }.bind(this));
      } else {
        // No user is signed in.
        this.setState({toRender: "SignInUp"});
      }
    }.bind(this));
  }

  render() {
    var rendered = <TitleScreen message="Loading" />;
    if (this.state.toRender === "Dashboard") {
      rendered = <Dashboard changeView={this.changeToRender} db={this.props.db}
                            gameId={this.state.gameId} setGameId={this.setGameId} />;
    } else if (this.state.toRender === "SignInUp") {
      rendered = <SignInUp db={this.props.db} />;
    } else if (this.state.toRender === "GameBoard") {
      rendered = <GameBoard db={this.props.db} uid={this.state.uid} 
                      changeView={function() { return this.changeToRender("Dashboard")}.bind(this)} />;
    }
    return rendered;
  }

  setGameId = (newId) => {
    var obj = {};
    obj.gameId = newId;
    obj.toRender = "GameBoard";
    this.props.db.doc("users/" + this.state.uid).update({currentGame: newId});
    this.setState(obj);
  }

  changeToRender = (changeKey) => {
    var tempState = {};
    tempState.toRender = changeKey;
    this.setState(tempState);
  }
}