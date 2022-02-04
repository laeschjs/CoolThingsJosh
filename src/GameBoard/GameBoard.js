import React, { Component } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import { doc, getDoc, getFirestore, increment, onSnapshot, updateDoc } from 'firebase/firestore';
import GameBoardView from './GameBoardView';
import { checkForSet } from '../Utilities';

export default class GameBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deck: [], selected: [], board: [],
      nextCard: null, state: "", urls: [],
      gameId: undefined, manualId: undefined
    }
  }

  async componentDidMount() {
    const db = getFirestore(this.props.firebaseApp);
    const userDoc = await getDoc(doc(db, 'users', this.props.uid));
    if (userDoc.exists()) {
      const gameId = userDoc.data().currentGame;
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        const removeListener = onSnapshot(gameRef, this.gameListener);
        this.setState({
          deck: gameData.deck,
          board: gameData.board,
          nextCard: gameData.nextCard,
          state: gameData.state,
          gameId: gameId,
          manualId: gameData.manualId,
          name: userDoc.data().name,
          removeListener
        });
      }
    }
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
      const db = getFirestore(this.props.firebaseApp);
      const userRef = doc(db, 'users', this.props.uid);
      updateDoc(userRef, { numSets: increment(1) });
      if (board.length <= 12) {
        this.add3Cards(sel[0], sel[1], sel[2], "found a set!");
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
        const gameRef = doc(db, 'games', this.state.gameId);
        updateDoc(gameRef, {
          board: board,
          state: this.state.name + " found a set!"
        });
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
      const db = getFirestore(this.props.firebaseApp);
      const gameRef = doc(db, 'games', this.state.gameId);
      updateDoc(gameRef, { state: "Game Over" });
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

    const db = getFirestore(this.props.firebaseApp);
    const gameRef = doc(db, 'games', this.state.gameId);
    updateDoc(gameRef, {
      board: board,
      nextCard: increment(3),
      state: this.state.name + " " + message
    });
  }

  gameListener = async (gameSnapshot) => {
    var newBoard = gameSnapshot.data().board;
    var nextCard = gameSnapshot.data().nextCard;
    var state = gameSnapshot.data().state;
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
      const db = getFirestore(this.props.firebaseApp);
      const userDoc = await getDoc(doc(db, 'users', this.props.uid));
      this.setState({
        board: newBoard,
        nextCard: nextCard,
        selected: [],
        state: "Game Over. You found " + userDoc.data().numSets + " sets"
      });
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