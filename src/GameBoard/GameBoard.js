import React, { Component } from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';
import GameBoardView from './GameBoardView';
import { checkForSet } from '../Utilities';

export default class GameBoard extends Component {
  constructor(props) {
    super(props);
    var imgs = {
      img0: "", img1: "", img2: "", img3: "",
      img4: "", img5: "", img6: "", img7: "",
      img8: "", img9: "", img10: "", img11: "",
      length: 12
    };
    this.state = {
      deck: [], selected: [], gameRef: undefined,
      nextCard: "", state: "", gameId: undefined,
      board: Object.assign({}, imgs), // Make a copy so they aren't
      urls: Object.assign({}, imgs)   // pointing at the same object
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
    for (var img in oldBoard) {
      if (oldBoard[img] !== newBoard[img]) {
        // The image at this board location has changed. Redraw it
        this.getImage(img);
      }
    }
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
      ...this.state.urls
    }
    return <GameBoardView {...passedProps} />
  }

  getImage = (index) => {
    firebase.storage().ref().child(this.state.board[index]+".png").getDownloadURL().then(function(url){
      var state = { urls: Object.assign({}, this.state.urls) };
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
    var board = JSON.parse(JSON.stringify(this.state.board));
    var sel = this.state.selected; // Just to not always type this.state.selected
    if (checkForSet(board[sel[0]], board[sel[1]], board[sel[2]])) {
      // Remove the set from the board
      for (var i = 0; i < 3; i++) {
        delete board[sel[i]];
      }
      // TODO: if more than 12 cards then rearrange and don't add
      // Add 3 more cards from the deck
      for (i = 0; i < 3; i++) {
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
    var board = JSON.parse(JSON.stringify(this.state.board));
    for (var i = 0; i < board.length - 2; i++) {
      for (var j = i + 1; j < board.length - 1; j++) {
        for (var k = j + 1; k < board.length; k++) {
          if (checkForSet(board["img" + i], board["img" + j], board["img" + k])) {
            return true
          }
        }
      }
    }
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
    var sel = this.state.selected.slice();
    var oldBoard = this.state.board;
    for (var img in oldBoard) {
      if (oldBoard[img] !== newBoard[img]) {
        if (sel.indexOf(img) !== -1) {
          // Also make it not selected anymore
          sel.splice(sel.indexOf(img),1);
        }
      }
    }
    this.setState({
      board: newBoard,
      nextCard: nextCard,
      selected: sel,
      state: state
    });
  }
}