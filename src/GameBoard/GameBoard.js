import React, { Component } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import GameBoardView from './GameBoardView';
import { checkForSet } from '../Utilities';

export default class GameBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deck: [], selected: [], board: [],
      nextCard: null, state: "", urls: [],
      gameRef: undefined, gameId: undefined,
      userRef: undefined, manualId: undefined
    }
  }

  componentDidMount() {
    var userRef = this.props.db.doc("users/" + this.props.uid);
    userRef.get().then(function(userDoc) {
      var gameId = userDoc.get("currentGame");
      var gameRef = this.props.db.doc("games/" + gameId);
      gameRef.get().then(function(gameDoc){
        var gameData = gameDoc.data();
        this.setState({
          deck: gameData.deck,
          board: gameData.board,
          nextCard: gameData.nextCard,
          state: gameData.state,
          gameId: gameId,
          manualId: gameData.manualId,
          name: userDoc.data().name
        });
      }.bind(this));
      var removeListener = gameRef.onSnapshot(this.gameListener);
      this.setState({
        removeListener: removeListener,
        gameRef: gameRef,
        userRef: userRef
      });
    }.bind(this));
  }

  componentWillUnmount() {
    this.state.removeListener();
  }

  componentDidUpdate(prevProps, prevState) {

    // Check if there was actually an update
    var oldBoard = prevState.board;
    var newBoard = this.state.board;
    if (oldBoard.toString() === newBoard.toString()) {
      return;
    }
    for (var i = 0; i < newBoard.length; i++) {
      if (oldBoard[i] !== newBoard[i]) {
        // The image at this board location has changed. Redraw it
        this.getImage(i);
      }
    }
    if (newBoard.length < oldBoard.length) {
      var state = {};
      state.urls = this.state.urls.slice(0,newBoard.length);
      this.setState(state);
    }
  }

  render() {
    var ID = this.state.gameId; // Handle legacy games
    if (this.state.manualId) {
      ID = this.state.manualId;
    }
    var passedProps = {
      selected: this.state.selected,
      imgSelected: this.imgSelected,
      gameId: ID,
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
    var endIndex = board.length;
    var sel = this.state.selected; // Just to not always type this.state.selected
    if (checkForSet(board[sel[0]], board[sel[1]], board[sel[2]])) {
      if (board.length <= 12) {
        this.add3Cards(sel[0], sel[1], sel[2], "found a set!");
        this.state.userRef.update({numSets: firebase.firestore.FieldValue.increment(1)});
      } else {
        sel.sort(function(a, b) { return b - 0 - (a - 0)});
        for (var i = 0; i < 3; i++) {
          if (sel[i] < 12) {
            endIndex--;
            board[sel[i]] = board[endIndex];
            board.splice(endIndex,1);
          } else {
            endIndex--;
            board.splice(sel[i],1);
          }
        }
        var newBoard = {
          board: board,
          state: this.state.name + " found a set!"
        }
        this.state.gameRef.update(newBoard);
        this.state.userRef.update({numSets: firebase.firestore.FieldValue.increment(1)});
      }
    } else {
      this.setState({state: "Look closer because that isn't a Set"});
    }
  }

  checkSet = () => {
    var board = this.state.board.slice();
    for (var i = 0; i < board.length - 2; i++) {
      for (var j = i + 1; j < board.length - 1; j++) {
        for (var k = j + 1; k < board.length; k++) {
          if (checkForSet(board[i], board[j], board[k])) {
            return true;
          }
        }
      }
    }
    // No set found so add 3 more cards if available
    if (this.state.nextCard >= 81) {
      console.log("The game has ended");
      this.state.gameRef.update({state: "Game Over"});
      return false;
    }

    this.add3Cards(board.length, board.length + 1, board.length + 2,
      "added more cards because no sets were found");
    return false;
  }

  add3Cards = (index1, index2, index3, message) => {
    var board = this.state.board.slice();
    if (this.state.nextCard < 81) {
      // Add 3 more cards from the deck
      board[index1] = this.state.deck[this.state.nextCard];
      board[index2] = this.state.deck[this.state.nextCard + 1];
      board[index3] = this.state.deck[this.state.nextCard + 2];
    } else {
      board.splice(index3,1);
      board.splice(index2,1);
      board.splice(index1,1);
    }
    var newBoard = {
      board: board,
      nextCard: firebase.firestore.FieldValue.increment(3),
      state: this.state.name + " " + message
    }
    this.state.gameRef.update(newBoard);
  }

  gameListener = (gameSnapshot) => {
    var newBoard = gameSnapshot.get("board");
    var nextCard = gameSnapshot.get("nextCard");
    var state = gameSnapshot.get("state");
    // Check if there was actually an update
    if (newBoard.toString() === this.state.board.toString() &&
        state === this.state.state) {
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
    if (state === "Game Over") {
      this.state.userRef.get().then(function(userDoc) {
        this.setState({
          board: newBoard,
          nextCard: nextCard,
          selected: [],
          state: "Game Over. You found " + userDoc.get("numSets") + " sets"
        })
      }.bind(this));
    } else {
      this.setState({
        board: newBoard,
        nextCard: nextCard,
        selected: [],
        state: state
      });
    }
  }
}