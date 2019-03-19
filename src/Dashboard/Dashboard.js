import React, { Component } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import './Dashboard.css';
import { makeDeck } from '../Utilities';

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      big: false,
      enteredGameId: ""
    }
  }

  render() {
    var isDisabled = "disabled";
    var resumeClick = "";
    if (this.props.gameId) {
      isDisabled = "";
      resumeClick = this.resume;
    }

    var joinCardClass = "joinCard " + this.state.joinAnim;
    var joinCard = (
      <div id="joinCard" className={joinCardClass} onClick={this.join}><span className="titleSpan">Join Game</span></div>
    );
    if (this.state.big) {
      //TODO
      joinCard = (
        <div id="joinCardBig" className="joinCard">
          <span className="icon" onClick={this.notjoin}>
            <i className="fas fa-arrow-left"></i>
          </span>
          <div className="input-field col s12">
            <input id="gameIdInput" type="text" value={this.state.enteredGameId} onChange={this.changeGameId} />
            <label htmlFor="gameIdInput">Game Id</label>
          </div>
        </div>
      );
    }
    return (
      <div id="dashboardContainer">
        <div className="myRow row">
          <div id="resumeCard" className={"myCard col s4 offset-s1 " + isDisabled} onClick={resumeClick}><span className="titleSpan">Resume Game</span></div>
          <div id="newCard" className="myCard col s4 offset-s2" onClick={this.newGame}><span className="titleSpan">New Game</span></div>
        </div>
        <div className="myRow row">
          {joinCard}
          <div className="col s4 offset-s1"></div>
          <div id="logoutCard" className="myCard col s4 offset-s2" onClick={this.logout}><span className="titleSpan">Logout</span></div>
        </div>
      </div>
    );
  }

  logout = () => {
    firebase.auth().signOut().then(function() {
      console.log("successful sign out");
    }).catch(function(error) {
      console.log("There was an error signing out:");
      console.log(error.message);
    })
  }

  newGame = () => {
    var deck = makeDeck();
    var boardArr = deck.slice(0,12);
    var board = {};
    for (var i = 0; i < boardArr.length; i++) {
      board["img" + i] = boardArr[i];
    }
    this.props.db.collection("games").add({
      state: "Waiting",
      queue: [],
      board: board,
      deck: deck,
      nextCard: 12
    })
    .then(function(docRef) {
      this.props.setGameId(docRef.id);
      this.props.db.collection("users").doc(this.props.uid).set({
        currentGame: docRef.id
      }, {merge: true})
      .then(function() {
        this.props.changeView("GameBoard");
      }.bind(this))
      .catch(function(error) {
        alert("There was an error");
      })
    }.bind(this))
    .catch(function(error) {
      console.log("Error adding document: ", error);
    });
  }

  resume = () => {
    this.props.changeView("GameBoard");
  }

  join = () => {
    this.setState((prevState, props) => {
      return {
        big: !prevState.big,
        joinAnim: "joinCardAnim"
      };
    });
  }

  notjoin = () => {
    this.setState({big: false});
  }

  changeGameId = (e) => {
    var obj = {};
    obj.enteredGameId = e.target.value;
    this.setState(obj);
  }
}