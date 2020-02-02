
import React from 'react';
import { View } from 'react-native';
import { Avatar, Button, Text, ThemeProvider } from 'react-native-elements';
import { createStackNavigator } from 'react-navigation';
import { Linking } from 'expo';
import * as Facebook from 'expo-facebook';
import * as WebBrowser from 'expo-web-browser';

import Colors from '../common/colors';
import theme from '../common/theme';
import { db, firebase } from '../config';
import getEnvVars from '../environment';

const { facebookConfig } = getEnvVars();

let updateLoginStatus = null;
let updateRoles = null;

// Listen for authentication state to change.
// When user logs in, update login status and add a listener for any metadata changes,
// which will be related to role changes
let metadataCallbackUnsubscribe = null;
const loginSuccessCallback = user => {
    console.log('AUTH onAuthStateChanged');
    // Remove previous listener.
    metadataCallbackUnsubscribe && metadataCallbackUnsubscribe();
    // On user login add new listener
    if (user) {
        console.log('We are authenticated now!');
        updateLoginStatus && updateLoginStatus();
        
        // Check if refresh is required.
        metadataCallbackUnsubscribe = db.collection('metadata').doc(user.uid)
        .onSnapshot(snapshot => {
            console.log('medataChangeCallback', snapshot.data());
            // Force refresh to pick up the latest custom claims changes.
            // Note this is always triggered on first call. Further optimization could be
            // added to avoid the initial trigger when the token is issued and already contains
            // the latest claims.
            user.getIdTokenResult(true)
            .then(idTokenResult => {
                const claims = idTokenResult && idTokenResult.claims;
                if (claims) {
                    console.log('CLAIMS!', claims);
                    updateRoles && updateRoles(claims);
                }
            });
        });
    }
};
firebase.auth().onAuthStateChanged(loginSuccessCallback);

class SignInScreen extends React.Component {
    static navigationOptions = {
        title: 'Sign in'
    };

    state = {
        loggedIn: false,
        givenName: null,
        picture: null,
        isBoss: false,
        isAdmin: false
    };

    componentDidMount() {
        console.log('****** SIGNIN DID MOUNT ******');
        // the componentDidMount event will happen before the firebase auth onAuthStateChanged event will have fired (and the role/metadata update)
        // so we can make this instance method available to that listener
        updateLoginStatus = () => this._updateLoginStatus();
        updateRoles = claims => this._updateRoles(claims);
    }

    componentWillUnmount() {
        console.log('****** SIGNIN WILL UNMOUNT ******');
        metadataCallbackUnsubscribe && metadataCallbackUnsubscribe();
        updateLoginStatus = () => false;
        updateRoles = () => false;
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

    _updateRoles = function(claims) {
        if (!claims) { return; }
        this.setState({
            isBoss: !!claims.boss,
            isAdmin: !!claims.admin
        });
    };

    _loginWithFacebook = async function () {
        // check if logged in first
        const user = firebase.auth().currentUser;
        if (user) {
            return loginSuccessCallback(user);
        }
        await Facebook.initializeAsync(facebookConfig.appId);
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
        <ThemeProvider theme={theme}>
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
                        <Text style={{alignSelf: 'center'}}>Hey {this.state.givenName}!
                        { this.state.isAdmin && ' You are an admin!'}
                        { this.state.isBoss && ' You are a BOSS!'}</Text>
                    </View>
                )}
                <View style={{padding: 50}}>
                    { !this.state.loggedIn && <Button
                        title='Login'
                        onPress={() => this._loginWithFacebook()}
                    /> }
                    { this.state.loggedIn && <Button
                        title='Continue'
                        onPress={() => this.props.navigation.navigate('Main', {isAdmin: this.state.isAdmin, isBoss: this.state.isBoss})}
                        containerStyle={{marginBottom: 20}}
                    /> }
                    { this.state.loggedIn && <Button
                        title='Logout'
                        type='outline'
                        onPress={() => this._logoutFromFirebase()}
                        buttonStyle={{
                            backgroundColor: Colors.white,
                            borderColor: Colors.pop
                        }}
                        titleStyle={{
                            color: Colors.pop
                        }}
                    /> }
                </View>
            </View>
        </ThemeProvider>
    );
  }
}

export default createStackNavigator({
    SignIn: SignInScreen
}, {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.pop,
      },
      headerTitleStyle: {
        color: Colors.white,
        fontFamily: 'montserrat'
      },
    }
});