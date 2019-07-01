import React, { Component } from 'react';

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
          <span className="green-text">
            <i className="fas fa-check-circle"></i>
          </span>
        );
      }
      cols.push(
        <div key={"col" + i % 4} className="col s3 center-align">
          {check}
          <img onClick={this.props.imgSelected(i)} src={this.props.urls[i]} alt="Game Card" />
        </div>
      );
      if (i % 4 === 3 || i === this.props.urls.length - 1) {
        rows.push(
          <div key={"row" + (i / 4 + 1)} className="row">
            {cols}
          </div>
        );
        cols = []
      }
    }

    var submitButton = <button disabled={true}>Select 3 cards</button>;
    if (this.props.selected.length === 3) {
      submitButton=<button onClick={this.props.submitSet}>Submit Set</button>
    }
    return (
      <div>
        {rows}<br />
        <div className="center-align">
          {submitButton}<br />
          GameId:&nbsp;{this.props.gameId}<br />
          <button onClick={this.props.changeView}>Back to Dashboard</button><br />
          {this.state.message}<br />
          <button onClick={this.checkSet}>I don't think a Set exists</button>
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