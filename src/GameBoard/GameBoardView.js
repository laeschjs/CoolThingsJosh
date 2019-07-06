import React, { Component } from 'react';
import './GameBoardView.css';

var SETEXISTS = "A set exists! Keep searching!";

export default class GameBoardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ""
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if ((prevProps.message !== this.props.message 
        || prevProps.urls.join(",") !== this.props.urls.join(","))
          && prevProps.message !== "Game Over") {
      this.setState({message: this.props.message});
    }
  }

  render() {
    var rows = [];
    var cols = [];
    var check = "";
    for (var i = 0; i < this.props.urls.length; i++) {
      check = "";
      if (this.props.selected.indexOf(i) !== -1) {
        check = (
          <span className="checkMark" onClick={this.props.imgSelected(i)}>
            <i className="fas fa-check-circle"></i>
          </span>
        );
      }
      cols.push(
        <div key={"col" + i % 3} className="myCol center-align">
          {check}
          <img className={"cardImage"} onClick={this.props.imgSelected(i)} src={this.props.urls[i]} alt="Game Card" />
        </div>
      );
      if (i % 3 === 2 || i === this.props.urls.length - 1) {
        rows.push(
          <div key={"row" + (i / 4 + 1)} className="row myRow">
            {cols}
          </div>
        );
        cols = []
      }
    }

    var submitButton = <div id="submit" className="button disabled">Select 3 cards</div>;
    if (this.props.selected.length === 3) {
      submitButton=<div id="submit" className="button" onClick={this.props.submitSet}><span className="buttonSpan">Submit Set</span></div>
    }
    return (
      <div style={{height: "90%", marginTop: "1%"}}>
        {rows}<br />
        <div style={{height: "25%"}} className="center-align">
          <div className="bottomPane">
            {submitButton}<br />
            <div className="button" id="back" onClick={this.props.changeView}>Back to Dashboard</div><br />
            <div className="button" id="check" disabled={this.state.message === "Game Over"} onClick={this.checkSet}>I don't think a Set exists</div>
          </div>
          <div className="bottomPane">
            <span className="rightPane">GameId:&nbsp;{this.props.gameId}</span><br />
            <span className="rightPane">{this.state.message}</span>
          </div>
        </div>
      </div>
    )
  }

  checkSet = () => {
    if (this.props.checkSet()) {
      this.setState({message: SETEXISTS});
    }
  }
}