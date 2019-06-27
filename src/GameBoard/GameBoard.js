import React, { Component } from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';
import GameBoardView from './GameBoardView';
import { checkForSet } from '../Utilities';

export default class GameBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deck: [], selected: [], board: [],
      nextCard: "", state: "", urls: [],
      gameRef: undefined, gameId: undefined
    }
  }

  componentDidMount() {
    var userRef = this.props.db.doc("users/" + this.props.uid);
    userRef.get().then(function(userDoc) {
      var gameId = userDoc.data().currentGame;
      var gameRef = this.props.db.doc("games/" + gameId);
      gameRef.get().then(function(gameDoc){
        var gameData = gameDoc.data();
        this.setState({
          deck: gameData.deck,
          board: gameData.board,
          nextCard: gameData.nextCard,
          state: gameData.state,
          gameId: gameId,
          name: userDoc.data().name
        });
      }.bind(this));
      var removeListener = gameRef.onSnapshot(this.gameListener);
      this.setState({
        removeListener: removeListener,
        gameRef: gameRef
      });
    }.bind(this));
  }

  componentWillUnmount() {
    this.state.removeListener();
  }

  componentDidUpdate(prevProps, prevState) {
    // (maybe) TODO: Check if the game is over
    // if (this.state.urls["img11"] === "") {
    //   this.props.changeView()
    // }
    // Check if there was actually an update
    if (prevState.nextCard === this.state.nextCard) {
      return;
    }
    var oldBoard = prevState.board;
    var newBoard = this.state.board;
    for (var i = 0; i < newBoard.length; i++) {
      if (oldBoard[i] !== newBoard[i]) {
        // The image at this board location has changed. Redraw it
        this.getImage(i);
      }
    }
    var state = {};
    state.urls = this.state.urls.slice(0,newBoard.length);
    this.setState(state);
  }

  render() {
    var passedProps = {
      selected: this.state.selected,
      imgSelected: this.imgSelected,
      gameId: this.state.gameId,
      submitSet: this.submitSet,
      changeView: this.props.changeView,
      message: this.state.state,
      checkSet: this.checkSet,
      urls: this.state.urls
    }
    return <GameBoardView {...passedProps} />
  }

  getImage = (index) => {
    firebase.storage().ref().child(this.state.board[index]+".png").getDownloadURL().then(function(url){
      var state = {};
      state.urls = this.state.urls.slice();
      state.urls[index] = url;
      this.setState(state);
    }.bind(this)).catch(function(error){
      console.log(error);
    });
  }

  imgSelected = (boardIndex) => {
    return function() {
      var cpy = this.state.selected.slice();
      var selectedIndex = this.state.selected.indexOf(boardIndex);
      if (selectedIndex === -1) {
        cpy.push(boardIndex);
      } else {
        cpy.splice(selectedIndex,1);
      }
      if (cpy.length > 3) {
        cpy.splice(0,1);
      }
      this.setState({selected: cpy});
    }.bind(this)
  }

  submitSet = () => {
    var board = this.state.board.slice();
    var sel = this.state.selected; // Just to not always type this.state.selected
    if (checkForSet(board[sel[0]], board[sel[1]], board[sel[2]])) {
      // TODO: if more than 12 cards then rearrange and don't add

      // Add 3 more cards from the deck
      for (var i = 0; i < 3; i++) {
        board[sel[i]] = this.state.deck[this.state.nextCard + i];
      }
      var newBoard = {
        board: board,
        nextCard: this.state.nextCard + 3,
        state: this.state.name + " found a set!"
      }
      this.state.gameRef.update(newBoard);
    }
  }

  checkSet = () => {
    var board = this.state.board.slice();
    for (var i = 0; i < board.length - 2; i++) {
      for (var j = i + 1; j < board.length - 1; j++) {
        for (var k = j + 1; k < board.length; k++) {
          if (checkForSet(board[i], board[j], board[k])) {
            return true
          }
        }
      }
    }
    // No set found so add 3 more cards
    return false
  }

  gameListener = (gameSnapshot) => {
    var newBoard = gameSnapshot.get("board");
    var nextCard = gameSnapshot.get("nextCard");
    var state = gameSnapshot.get("state");
    // Check if there was actually an update
    if (nextCard === this.state.nextCard) {
      return;
    }
    //MAYBE look into keeping cards selected that weren't
    //removed from another user finding a set
    // var sel = this.state.selected.slice();
    // var oldBoard = this.state.board.slice();
    // for (var i = 0; i < oldBoard.length; i++) {
    //   if (oldBoard[i] !== newBoard[i]) {
    //     if (sel.indexOf(i) !== -1) {
    //       // Also make it not selected anymore
    //       sel.splice(i,1);
    //     }
    //   }
    // }
    this.setState({
      board: newBoard,
      nextCard: nextCard,
      selected: [],
      state: state
    });
  }
}