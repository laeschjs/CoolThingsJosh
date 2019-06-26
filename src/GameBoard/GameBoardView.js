import React, { Component } from 'react';

export default class GameBoardView extends Component {
  render() {
    var rows = [];
    var cols = [];
    var check = "";
    for (var i = 0; i < 12; i++) {
      check = "";
      if (this.props.selected.indexOf("img" + i) !== -1) {
        check = (
          <span className="green-text">
            <i className="fas fa-check-circle"></i>
          </span>
        );
      }
      cols.push(
        <div key={"col" + i % 4} className="col s3 center-align">
          {check}
          <img onClick={this.props.imgSelected("img" + i)} src={this.props["img" + i]} alt="Game Card" />
        </div>
      );
      if (i % 4 === 3) {
        rows.push(
          <div key={"row" + (i / 4 + 1)} className="row">
            {cols}
          </div>
        );
        cols = []
      }
    }

    var checkSet = <button disabled={true}>Select 3 cards</button>;
    if (this.props.selected.length === 3) {
      checkSet=<button onClick={this.props.checkForSet}>Check For Set</button>
    }

    var message;
    if (this.props.message !== "Waiting") {
      message = this.props.message;
    }
    return (
      <div>
        {rows}<br />
        <div className="center-align">
          {checkSet}<br />
          GameId:&nbsp;{this.props.gameId}<br />
          <button onClick={this.props.changeView}>Back to Dashboard</button><br />
          {message}
        </div>
      </div>
    )
  }
}