import React, { Component } from 'react';
import './TitleScreen.css';

export default class TitleScreen extends Component {
  // constructor(props) {
  //   super(props);
  //   firebase.storage().ref().child('title.png').getDownloadURL().then(function(url){
  //     this.setState({img: url});
  //   }.bind(this)).catch(function(error){
  //     console.log(error);
  //   });
  //   this.state = {
  //     img: ""
  //   }
  // }

  render() {
    return (
      <div id="titleContainer">
        <div id="S" className="card">S</div>
        <div id="E" className="card">E</div>
        <div id="T" className="card">T</div>
        <div id="loading">
          <span id="loadingSpan">{this.props.message}</span>
          <div className="preloader-wrapper active">
            <div className="spinner-layer spinner-red-only">
              <div className="circle-clipper left">
                <div className="circle"></div>
              </div><div className="gap-patch">
                <div className="circle"></div>
              </div><div className="circle-clipper right">
                <div className="circle"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}