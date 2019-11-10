import React from 'react';
import { View, ScrollView } from 'react-native';
import { Divider, ListItem, Text } from 'react-native-elements';

import { db } from '../config';
import commonStyles from '../common/styles';
import { formatDate } from '../common/utilities';

export default class QueensScreen extends React.Component {
    unsubscribe = null;
    state = {
        userID: 'testUserID',
        classList: [],
        bookings: []
    };
    // Note: may need to use componentWillFocus / componentWillBlur as with BossScreen
    componentDidMount() {
        this.unsubscribe = db.collection('classes').orderBy('startTime')
        .onSnapshot(querySnapshot => {
            const list = [];
            querySnapshot.forEach((doc) => {
                console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
                list.push(doc.data());
            });
            const myList = list.filter(c => c.bookings && c.bookings.includes(this.state.userID));
            this.setState({
                classList: list,
                bookings: myList
            });
        });
    }
    componentWillUnmount() {
        this.unsubscribe && this.unsubscribe();
    }
    render() {
        return (
            <ScrollView style={commonStyles.container}>
                <View>
                    <Text h4 style={commonStyles.headingText}>My bookings</Text>
                </View>
                <Divider />
                <View>
                    { this.state.bookings && this.state.bookings.map((c, i) => (
                        <ListItem
                            key={i}
                            title={c.name + ' @ ' + c.location}
                            subtitle={formatDate(c.startTime) + ' / ' + c.duration + ' minutes'}
                            bottomDivider
                            onPress={() => this.props.navigation.navigate('ClassDetail')}
                        />
                    ))}
                    { this.state.bookings && this.state.bookings.length === 0 && <Text style={[commonStyles.bodyText, {marginVertical: 20}]}>No bookings</Text> }
                </View>
                <Divider />
                <View>
                    <Text h4 style={commonStyles.headingText}>All classes</Text>
                </View>
                <Divider />
                <View>
                    { this.state.classList && this.state.classList.map((c, i) => (
                        <ListItem
                            key={i}
                            title={c.name + ' @ ' + c.location}
                            subtitle={formatDate(c.startTime) + ' / ' + c.duration + ' minutes'}
                            bottomDivider
                            chevron
                            onPress={() => this.props.navigation.navigate('ClassDetail')}
                        />
                    ))}
                    { this.state.classList && this.state.classList.length === 0 && <Text>No classes</Text> }
                </View>
            </ScrollView>
        );
    }
}

QueensScreen.navigationOptions = {
  title: 'Queens',
};
