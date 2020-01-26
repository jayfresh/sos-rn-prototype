import React from 'react';
import { View, ScrollView } from 'react-native';
import { Divider, ListItem, Text } from 'react-native-elements';

import { db, firebase } from '../config';
import commonStyles from '../common/styles';
import { classTitle, classSubtitle } from '../common/utilities';

export default class QueensScreen extends React.Component {
    unsubscribe = null;
    state = {
        classList: [],
        bookings: []
    };
    // Note: may need to use onComponentFocus / onComponentBlur as with BossScreen
    componentDidMount() {
        console.log('QueenScreen did mount');
        const loggedInQueenId = firebase.auth().currentUser.uid;
        this.unsubscribe = db.collection('classes').orderBy('startTime')
        .onSnapshot(querySnapshot => {
            const list = [];
            querySnapshot.forEach((doc) => {
                console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
                list.push(Object.assign(doc.data(), {id: doc.id}));
            });
            const myList = list.filter(c => c.bookings && c.bookings.includes(loggedInQueenId));
            this.setState({
                classList: list,
                bookings: myList
            });
        });
    }
    componentWillUnmount() {
        console.log('QueenScreen will unmount');
        this.unsubscribe && this.unsubscribe();
    }
    render() {
        return (
            <ScrollView style={commonStyles.container}>
                <View>
                    <Text h4 style={commonStyles.headingText}>My schedule</Text>
                </View>
                <Divider />
                <View>
                    { this.state.bookings && this.state.bookings.map((c, i) => (
                        <ListItem
                            key={i}
                            title={classTitle(c)}
                            subtitle={classSubtitle(c)}
                        />
                    ))}
                    { this.state.bookings && this.state.bookings.length === 0 && <Text style={[commonStyles.bodyText, {marginVertical: 20}]}>No bookings</Text> }
                </View>
                <Divider />
                <View>
                    <Text h4 style={commonStyles.headingText}>All BOSS classes</Text>
                </View>
                <Divider />
                <View>
                    { this.state.classList && this.state.classList.map((c, i) => (
                        <ListItem
                            key={i}
                            title={classTitle(c)}
                            subtitle={classSubtitle(c)}
                            bottomDivider
                            chevron
                            onPress={() => this.props.navigation.navigate('ClassDetail', {class: c})}
                        />
                    ))}
                    { this.state.classList && this.state.classList.length === 0 && <Text style={[commonStyles.bodyText, {marginVertical: 20}]}>No classes</Text> }
                </View>
            </ScrollView>
        );
    }
}

QueensScreen.navigationOptions = {
    title: 'Hey Queen!'
};
