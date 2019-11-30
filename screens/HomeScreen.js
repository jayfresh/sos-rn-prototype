import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Facebook from 'expo-facebook';
import { Avatar, Button, Divider, ListItem } from 'react-native-elements';

import { db, firebase } from '../config';
import commonStyles from '../common/styles';
import AddItem from '../components/AddItem';

import getEnvVars from '../environment';
const { facebookConfig } = getEnvVars();

let list = null;

// Listen for authentication state to change.
firebase.auth().onAuthStateChanged(user => {
  if (user != null) {
    console.log('We are authenticated now!');
  }
});

class LoginContainer extends React.Component {
    _loginWithFacebook = async function () {
        const result = await Facebook.logInWithReadPermissionsAsync(
            facebookConfig.appId,
            { permissions: ['public_profile'] }
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
                const user = firebase.auth().currentUser;
                console.log('firebase user', user);
                this.props.setParentState({
                    loggedIn: true,
                    givenName: user.displayName,
                    picture: user.photoURL
                });
            })
            .catch(error => {
                console.log('error', error);
            });
        }
    };

    render() {
        return (
            <Button
                title='Login'
                onPress={() => this._loginWithFacebook()}
            />
        );
    }
}

export default class HomeScreen extends React.Component {
    unsubscribe = null;
    state = {
        loggedIn: false,
        givenName: null,
        picture: null,
        userList: list
    };
    componentDidMount() {
        // TODO: I think I need to move to use React Navigation focus on all these main tab screens
        // as they all get re-mounted after navigating off them
        // consequence is the listeners are re-added when the screen is not visible
        console.log('HomeScreen did mount');
        this.unsubscribe = db.collection('users').orderBy('firstname')
        .onSnapshot(querySnapshot => {
            list = [];
            querySnapshot.forEach((doc) => {
                console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
                list.push(doc.data());
            });
            this.setState({
                userList: list
            });
        });
    }
    componentWillUnmount() {
        console.log('HomeScreen will unmount');
        this.unsubscribe && this.unsubscribe();
    }
    render() {
        return (
            <View style={commonStyles.container}>
                <ScrollView
                    style={commonStyles.container}
                    contentContainerStyle={styles.contentContainer}>
                    <View style={styles.welcomeContainer}>
                        <Image
                            source={require('../assets/images/sos_icon.png')}
                            style={styles.welcomeImage}
                        />
                    </View>
                    <View style={styles.getStartedContainer}>
                        <AddItem text='Add a teacher' onPress={() => this.onPress() } />
                        <LoginContainer setParentState={state => this.setState(state)} />
                        { this.state.loggedIn && (
                            <View style={{display: 'flex', flexDirection: 'row'}}>
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
                    </View>
                    <Text style={{margin: 20}}>Teachers</Text>
                    <Divider />
                    <View>
                        { this.state.userList && this.state.userList.map((l, i) => (
                            <ListItem
                                key={i}
                                leftAvatar={{ source: { uri: l.picture } }}
                                title={l.firstname + ' ' + l.lastname}
                                subtitle={l.email}
                                bottomDivider
                                onPress={_ => {
                                    this.props.navigation.navigate('Boss', {userEmail: l.email});
                                }}
                            />
                        ))}
                        { this.state.userList && this.state.userList.length === 0 && <Text>No teachers</Text> }
                    </View>
                </ScrollView>
            </View>
        );
    }

    onPress() {
        this.props.navigation.navigate('NewTeacher');
    }
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  }
});
