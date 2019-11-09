import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import commonStyles from '../common/styles';
import AddItem from '../components/AddItem';

const list = [
  {
    name: 'Amy Farha',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
    subtitle: 'amy@livingandfeeling.com'
  },
  {
    name: 'Chris Jackson',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    subtitle: 'chrisjackson97@gmail.com'
  }
];

export default class HomeScreen extends React.Component {
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
                </View>
                <Text style={{margin: 20}}>Teachers</Text>
                <Divider />
                <View>
                    {
                        list.map((l, i) => (
                        <ListItem
                            key={i}
                            leftAvatar={{ source: { uri: l.avatar_url } }}
                            title={l.name}
                            subtitle={l.subtitle}
                            bottomDivider
                        />
                        ))
                    }
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
