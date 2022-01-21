import React, { Component } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import './Dashboard.css';
import './NewGame.css';
import './JoinGame.css';
import { makeDeck } from '../Utilities';

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      joinBig: false,
      newBig: false,
      joinGameId: "",
      newGameId: ""
    }
  }

  componentDidUpdate(prevProps, prevState) {
    var joinId = this.state.joinGameId;
    if ((joinId !== "") && (prevState.joinGameId !== joinId)) {
      this.props.db.collection("games/").where("manualId", "==", joinId).get().then(function(querySnapshot){
        querySnapshot.forEach(function(queryDocSnapshot) {
          this.props.setGameId(queryDocSnapshot.id);
        }, this);
      }.bind(this));
    }

    var newGameId = this.state.newGameId;
    if (newGameId.length >= 4) {
      this.newGame(newGameId);
    }
  }

  render() {
    var isDisabled = "disabled";
    var resumeClick = function(){};
    if (this.props.gameId) {
      isDisabled = "";
      resumeClick = this.resume;
    }
    var mainCardClass = "myCard col s10 offset-s1 m4 offset-";
    //Hacky way to prevent the animation from happen upon viewing the page for the first time
    var joinCardClass = mainCardClass + "m1 " + this.state.joinAnim;
    var newCardClass = mainCardClass + "m2";

    var joinCard = (
      <div id="joinCard" className={joinCardClass} onClick={this.grow("join")}><span className="titleSpan">Join Game</span></div>
    );
    var newCard = (
      <div id="newCard" className={newCardClass} onClick={this.grow("new")}><span className="titleSpan">New Game</span></div>
    );

    if (this.state.joinBig) {
      joinCard = (
        <div>
          <div id="joinCardBig" className="Big">
            <span className="icon" onClick={this.shrink("join")}>
              <i className="fas fa-arrow-left"></i>
            </span>
            <div className="input-field col s12">
              <input id="gameIdInput" type="text" value={this.state.joinGameId} onChange={this.changeGameId("join")} />
              <label htmlFor="gameIdInput">Game Id</label>
            </div>
          </div>
          <div className="col s10 offset-s1 m4 offset-m1"></div>
        </div>
      ); // second div is to keep logout stable
    }
    if (this.state.newBig) {
      newCard = (
        <div>
          <div id="newCardBig" className="Big">
            <span className="icon" onClick={this.shrink("new")}>
              <i className="fas fa-arrow-left"></i>
            </span>
            <div className="input-field col s12">
              <input id="gameIdInput" type="text" value={this.state.newGameId} 
                onChange={this.changeGameId("new")} placeholder="Enter 4 digits" />
              <label htmlFor="gameIdInput">Game Id</label>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div id="dashboardContainer">
        <div className="cardRow row">
          <div id="resumeCard" className={"myCard col s10 offset-s1 m4 offset-m1 " + isDisabled} onClick={resumeClick}><span className="titleSpan">Resume Game</span></div>
          {newCard}
          <div className="col m1"></div>
        </div>
        <div className="cardRow row">
          {joinCard}
          <div id="logoutCard" className="myCard col s10 offset-s1 m4 offset-m2" onClick={this.logout}><span className="titleSpan">Logout</span></div>
          <div className="col m1"></div>
        </div>
      </div>
    );
  }

  logout = () => {
    signOut(getAuth(this.props.firebaseApp)).then(function() {
      console.log("successful sign out");
    }).catch(function(error) {
      console.log("There was an error signing out:");
      console.log(error.message);
    })
  }

  newGame = (manualId) => {
    var deck = makeDeck();
    var boardArr = deck.slice(0,12);
    this.props.db.collection("games").add({
      state: "",
      queue: [],
      board: boardArr,
      deck: deck,
      nextCard: 12,
      manualId: manualId
    })
    .then(function(docRef) {
      this.props.setGameId(docRef.id);
    }.bind(this))
    .catch(function(error) {
      console.log("Error adding document: ", error);
    });
  }

  resume = () => {
    this.props.changeView("GameBoard");
  }

  grow = (card) => {
    return function() {
      var newState = {};
      newState[card + "Big"] = true;
      newState[card + "Anim"] = card + "CardAnim";
      this.setState(newState);
    }.bind(this);
  }

  shrink = (card) => {
    return function() {
      var newState = {};
      newState[card + "Big"] = false;
      newState[card + "GameId"] = "";
      this.setState(newState);
    }.bind(this);
  }

  changeGameId = (card) => {
    return function(e) {
      var val = e.target.value;
      var patt = /[^\w\d]/; // Find a non-word charater or a non-digit character
      if (patt.test(val)) { return; }
      var obj = {};
      obj[card + "GameId"] = val;
      this.setState(obj);
    }.bind(this);
  }
}