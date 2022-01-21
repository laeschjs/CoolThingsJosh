import React, { Component } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import './SignInUp.css';

export default class SignInUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: "in",
      name: "",
      email: "",
      password: "",
      confirm: "",
      message: "Email needs an '@'",
      disabled: true
    }
  }

  render() {
    var showExtraField = "none";
    var isSignInActive = "active tabActive";
    var isSignUpActive = "tabNotActive";
    if (this.state.formState === "up") {
      showExtraField = "block";
      isSignInActive = "tabNotActive";
      isSignUpActive = "active tabActive";
    }

    return (
      <div className="myContainer container">
        <div className="row">
          <div className="col s12 m6 offset-m3">
            <div className="card">
              <div className="card-content">
                <div className="row">
                  <div className="input-field col s12">
                    <ul className="tabs tabs-fixed-width">
                      <li className="tab"><a className={isSignInActive} onClick={this.switch("in")}>Sign In</a></li>
                      <li className="tab"><a className={isSignUpActive} onClick={this.switch("up")}>Sign Up</a></li>
                    </ul>
                  </div>
                </div>
                <div style={{display: showExtraField}} className="row">
                  <div className="input-field col s12">
                    <input id="name" type="text" value={this.state.name} onChange={this.changeField("name")} />
                    <label htmlFor="name">Name</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="email" type="email" className="validate" value={this.state.email} onChange={this.changeField("email")} />
                    <label htmlFor="email">Email</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="password" type="password" className="validate" value={this.state.password} onChange={this.changeField("password")} />
                    <label htmlFor="password">Password</label>
                  </div>
                </div>
                <div style={{display: showExtraField}} className="row">
                  <div className="input-field col s12">
                    <input id="password2" type="password" className="validate" value={this.state.confirm} onChange={this.changeField("confirm")} />
                    <label htmlFor="password2">Confirm Password</label>
                  </div>
                </div>
              </div>
              <div className="card-action">
                <div className="row" style={{marginBottom: "0px"}}>
                  <div id="submitSignInUp" className="col s5">
                    <button className="btn waves-effect waves-light" disabled={this.state.disabled} type="submit" name="action" onClick={this.submitted}>Submit
                      <i className="material-icons right">send</i>
                    </button>
                  </div>
                  <div id="messageBox" className="col s7">
                    {this.state.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  switch = (id) => {
    return function() {
      var state = JSON.parse(JSON.stringify(this.state));
      state.formState = id;
      if (this.checkForm(state)) {
        state.disabled = false;
        state.message = "";
      } else {
        state.disabled = true;
      }
      this.setState(state);
      return false; // Needed to prevent anchor tag doing default
    }.bind(this);
  }

  changeField = (key) => {
    return function(e) {
      var state = JSON.parse(JSON.stringify(this.state));
      state[key] = e.target.value;
      if (this.checkForm(state)) {
        state.disabled = false;
        state.message = "";
      } else {
        state.disabled = true;
      }
      this.setState(state);
    }.bind(this);
  }

  checkForm = (state) => {
    // Sign Up
    if (state.formState === "up") {
      // Check name
      if (state.name.length < 3) {
        state.message = "Name needs to be longer than 2 characters";
        return false;
      }
    }

    // Check email
    var email = state.email.split("@");
    if (email.length === 1) {
      state.message = "Email needs an '@'";
      return false;
    }
    if (email[1].length === 0) {
      state.message = "Email needs text after '@'";
      return false;
    }

    // Check password
    if (state.password.length < 7) {
      state.message = "Password needs to be longer than 6 characters";
      return false;
    }

    if (state.formState === "up") {
      // Confirm Password
      if (state.password !== state.confirm) {
        state.message = "Passwords do not match up";
        return false;
      }
    }
    return true;
  }

  submitted = (e) => {
    if (this.state.formState === "up") {
      firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(function(){
        console.log("Successful Sign Up");
        var userId = firebase.auth().currentUser.uid + "";
        this.props.db.collection("users").doc(userId).set({
          name: this.state.name,
          currentGame: "",
          numSets: 0
        }).then(function() {
          console.log("User Doc successfully created!");
        }).catch(function(error) {
          console.log("Error creating document:");
          console.log(error.message);
        });
      }.bind(this)).catch(function(error) {
        console.log("Error with Sign Up:");
        console.log(error.message);
        this.setState({
          message: error.message,
          disabled: true
        });
      }.bind(this));
    } else {
      firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).catch(function(error){
        console.log("Error with Sign In:");
        console.log(error.message);
        this.setState({
          message: error.message,
          disabled: true
        });
      })
    }
  }
}