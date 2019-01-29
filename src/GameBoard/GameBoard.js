import React, { Component } from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';
import TitleScreen from '../TitleScreen/TitleScreen';

export default class GameBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deck: [], board: [], selected: [],
      nextCard: "", state: "", gameId: undefined,
      img0: "", img1: "", img2: "", img3: "",
      img4: "", img5: "", img6: "", img7: "",
      img8: "", img9: "", img10: "", img11: ""
    }
  }

  componentDidMount() {
    var userRef = this.props.db.collection("users").doc(this.props.uid);
    userRef.get().then(function(userDoc) {
      var gameId = userDoc.data().currentGame;
      var gameRef = this.props.db.collection("games").doc(gameId);
      gameRef.get().then(function(gameDoc){
        var gameData = gameDoc.data();
        this.setState({
          deck: gameData.deck,
          board: gameData.board,
          nextCard: gameData.nextCard,
          state: gameData.state,
          gameId: gameId
        })
      }.bind(this))
    }.bind(this))
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.deck.length > prevState.deck.length) {
      for (var i = 0; i < 12; i++) {
        this.getImage(i);
      }
    }
  }

  render() {
    console.log("rendered");
    // console.log(this.state);
    if (this.state.img11 === "") {
      return <TitleScreen message="Creating your Game" />
    }
    var rows = [];
    var cols = [];
    var check = "";
    for (var i = 0; i < 12; i++) {
      check = "";
      if (this.state.selected.indexOf(i) !== -1) {
        check = (<span className="icon has-text-success">
            <i className="fas fa-check-circle"></i>
          </span>);
      }
      cols.push(<div key={"col" + i % 4} className="column has-text-centered">
        {check}
        <img onClick={this.imgSelected(i)} src={this.state["img" + i]} alt="Game Card" />
      </div>);
      if (i % 4 === 3) {
        rows.push(<div key={"row" + (i / 4 + 1)} className="columns is-mobile">
          {cols}
        </div>);
        cols = []
      }
    }
    return (
      <div>
        {rows}
        <br />
        GameId:&nbsp;{this.state.gameId}
      </div>
    )
  }

  getImage = (index) => {
    firebase.storage().ref().child(this.state.board[index]+".png").getDownloadURL().then(function(url){
      var key = "img" + index;
      var state = {};
      state[key] = url;
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
}