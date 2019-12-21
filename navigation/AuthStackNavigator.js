
import React from 'react';
import { View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-elements';
import { createStackNavigator } from 'react-navigation';
import { Linking } from 'expo';
import * as Facebook from 'expo-facebook';
import * as WebBrowser from 'expo-web-browser';

import { firebase } from '../config';
import getEnvVars from '../environment';
import CheckoutScreen from '../screens/CheckoutScreen';

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

    // openBrowserAsync requires that you subscribe to Linking events and the
    // resulting Promise only contains information about whether it was canceled
    // or dismissed
    //
    // ^^ the above message doesn't seem to be true for the Expo client app - the handlers I'm
    // setting up below are not calling _handleRedirect
    // It's unclear at the moment whether this is because it's the Expo client app or something else
    _openBrowserAsync = async () => {
        try {
            this._addLinkingListener();
            let result = await WebBrowser.openBrowserAsync(
                // We add `?` at the end of the URL since the test backend that is used
                // just appends `authToken=<token>` to the URL provided.
                `https://backend-xxswjknyfi.now.sh/?linkingUri=${Linking.makeUrl('/?')}`
            );
            // this._removeLinkingListener();
        } catch (error) {
            alert(error);
            console.log(error);
        }
    };

    _handleRedirect = event => {
        console.log('handle redirect', event);
        WebBrowser.dismissBrowser();
        let data = Linking.parse(event.url);
        console.log('linking URL', event.url);
        console.log('data back from browser', data);
    };

    _addLinkingListener = () => {
        Linking.addEventListener('url', this._handleRedirect);
    };

    _removeLinkingListener = () => {
        Linking.removeEventListener('url', this._handleRedirect);
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
                    title='Continue'
                    onPress={() => this.props.navigation.navigate('Main')}
                    containerStyle={{marginBottom: 20}}
                /> }
                { this.state.loggedIn && <Button
                    title='Logout'
                    onPress={() => this._logoutFromFirebase()}
                /> }
            </View>
            <View>
                <Button title='Test Purchase Flow' onPress={() => this._openBrowserAsync()} />
                <Button title='Test Purchase Flow with checkout screen' onPress={() => this.props.navigation.navigate('Checkout')} />
            </View>
        </View>
    );
  }
}

export default createStackNavigator({
    SignIn: SignInScreen,
    Checkout: CheckoutScreen
});