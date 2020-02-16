import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Divider, ListItem, Text, ThemeProvider } from 'react-native-elements';

import { db } from '../config';
import commonStyles from '../common/styles';
import theme from '../common/theme';
import AddItem from '../components/AddItem';

let list = null;

class HomeScreen extends React.Component {
    unsubscribe = null;
    state = {
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
        }, error => console.log(error));
    }
    componentWillUnmount() {
        console.log('HomeScreen will unmount');
        this.unsubscribe && this.unsubscribe();
    }
    render() {
        return (
            <ThemeProvider theme={theme}>
                <View style={commonStyles.container}>
                    <ScrollView
                        style={commonStyles.container}
                        contentContainerStyle={styles.contentContainer}>
                        <View style={styles.welcomeContainer}>
                            <Image
                                source={require('../assets/images/sos_icon.png')}
                                style={styles.welcomeImage}
                            />
                            <Text>BETA</Text>
                        </View>
                        <AddItem text='Add a BOSS' onPress={() => this.onPress() } />
                        <Text style={commonStyles.headingText}>BOSSES</Text>
                        <Divider />
                        <View>
                            { this.state.userList && this.state.userList.map((l, i) => (
                                <ListItem
                                    key={i}
                                    leftAvatar={{ source: { uri: l.photoURL } }}
                                    title={l.firstname + ' ' + l.lastname}
                                    subtitle={l.email}
                                    bottomDivider
                                    onPress={_ => {
                                        this.props.navigation.navigate('Boss', {userEmail: l.email, userUID: l.linkedUID});
                                    }}
                                />
                            ))}
                            { this.state.userList && this.state.userList.length === 0 && <Text>No BOSSES</Text> }
                        </View>
                    </ScrollView>
                </View>
            </ThemeProvider>
        );
    }

    onPress() {
        this.props.navigation.navigate('NewBoss');
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

export default HomeScreen;