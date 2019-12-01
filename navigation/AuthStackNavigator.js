
/*
class LoginContainer extends React.Component {
    _updateLoginStatus = function () {
        const user = firebase.auth().currentUser;
        console.log('firebase user', user);
        if (user != null) {
            this.props.setParentState({
                loggedIn: true,
                givenName: user.displayName,
                picture: user.photoURL
            });
        }
    };
    componentWillMount() {
        console.log('Login button will mount');
        this._updateLoginStatus();
    }
    _loginWithFacebook = async function () {
        const result = await Facebook.logInWithReadPermissionsAsync(
            facebookConfig.appId,
            { permissions: ['public_profile', 'email'] }
        );
        console.log(result);

        const {type, token} = result;

        if (type === 'success') {
            // Build Firebase credential with the Facebook access token.
            const credential = firebase.auth.FacebookAuthProvider.credential(token);
            console.log('credential', credential);

            // Sign in with credential from the Facebook user.
            firebase.auth().signInWithCredential(credential)
            .then(_ => {
                this._updateLoginStatus();
            })
            .catch(error => {
                console.log('error', error);
            });
        }
    };
    _logoutFromFirebase = async function() {
        firebase.auth().signOut();
        this.props.setParentState({
            loggedIn: false,
            givenName: null,
            picture: null
        });
    };

    render() {
        return (
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Button
                    title='Login'
                    onPress={() => this._loginWithFacebook()}
                />
                <Button
                    title='Logout'
                    onPress={() => this._logoutFromFirebase()}
                />
            </View>
        );
    }
}
*/

import React from 'react';
import { View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-elements';
import { createStackNavigator } from 'react-navigation';
import * as Facebook from 'expo-facebook';

import { firebase } from '../config';
import getEnvVars from '../environment';

const { facebookConfig } = getEnvVars();

let updateLoginStatus = null;

// Listen for authentication state to change.
firebase.auth().onAuthStateChanged(user => {
  if (user != null) {
    console.log('We are authenticated now!');
    updateLoginStatus && updateLoginStatus();
  }
});

class SignInScreen extends React.Component {
    static navigationOptions = {
        title: 'Sign in'
    };

    state = {
        loggedIn: false,
        givenName: null,
        picture: null
    };

    componentWillMount() {
        // the componentWillMount event will happen before the firebase auth onAuthStateChanged event will have fired
        // so we can make this instance method available to that listener
        updateLoginStatus = () => this._updateLoginStatus();
    }

    _updateLoginStatus = function () {
        const user = firebase.auth().currentUser;
        console.log('firebase user', user);
        if (user != null) {
            this.setState({
                loggedIn: true,
                givenName: user.displayName,
                picture: user.photoURL
            });
            // allow time for the welcome message to be displayed as a result of the state update
            setTimeout(_ => {
                this.props.navigation.navigate('Main');
            }, 2500);
        }
    };

    _loginWithFacebook = async function () {
        const result = await Facebook.logInWithReadPermissionsAsync(
            facebookConfig.appId,
            { permissions: ['public_profile', 'email'] }
        );
        console.log(result);

        const {type, token} = result;

        if (type === 'success') {
            // Build Firebase credential with the Facebook access token
            const credential = firebase.auth.FacebookAuthProvider.credential(token);
            console.log('credential', credential);

            // Sign in with credential from the Facebook user
            firebase.auth().signInWithCredential(credential)
            .catch(error => {
                console.log('error', error);
            });
        }
    };

    _logoutFromFirebase = async function() {
        firebase.auth().signOut();
        this.setState({
            loggedIn: false,
            givenName: null,
            picture: null
        });
    };

  render() {
    return (
        <View style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            { this.state.loggedIn && (
                <View style={{display: 'flex', flexDirection: 'row', padding: 50}}>
                    <Avatar
                        rounded
                        source={{
                            uri: this.state.picture
                        }}
                        containerStyle={{marginRight: 20}}
                    />
                    <Text style={{alignSelf: 'center'}}>Hello {this.state.givenName}!</Text>
                </View>
            )}
            <View style={{padding: 50}}>
                { !this.state.loggedIn && <Button
                    title='Login'
                    onPress={() => this._loginWithFacebook()}
                /> }
                { this.state.loggedIn && <Button
                    title='Logout'
                    onPress={() => this._logoutFromFirebase()}
                /> }
            </View>
        </View>
    );
  }
}

export default createStackNavigator({ SignIn: SignInScreen });