import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { Divider, ListItem, ThemeProvider } from 'react-native-elements';

import { db, firebase } from '../config';
import AddItem from '../components/AddItem';
import { withContext } from '../common/context';
import commonStyles from '../common/styles';
import theme from '../common/theme';
import { classTitle, classSubtitle } from '../common/utilities';

class BossScreen extends React.Component {
    unsubscribe = null;
    state = {
        classList: null,
        userEmail: null,
        userUID: null
    };
    subscribe() {
        if (this.unsubscribe) {
            console.log('BossScreen skipping setting classes listener as already set');
            return;
        }
        const userEmail = this.props.navigation.getParam('userEmail', null) || (firebase.auth().currentUser && firebase.auth().currentUser.email);
        const userUID = this.props.navigation.getParam('userUID', null) || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
        console.log('BossScreen userEmail/userUID params:', userEmail, userUID);
        this.setState({userEmail, userUID});

        this.unsubscribe = db.collection('classes')
        .where('instructor', '==', userUID)
        .orderBy('startTime')
        .onSnapshot(querySnapshot => {
            list = [];
            querySnapshot.forEach((doc) => {
                console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
                list.push(doc.data());
            });
            this.setState({
                classList: list
            });
        });
        console.log('BossScreen set classes listener');
    }
    onComponentFocus() {
        console.log('BossScreen will focus');
        this.subscribe();
    }
    onComponentBlur() {
        console.log('BossScreen will blur');
        console.log('removing BossScreen classes listener');
        this.unsubscribe && this.unsubscribe();
    }
    componentDidMount() {
        console.log('BossScreen did mount');
        this.subscribe();
    }
    componentWillUnmount() {
        console.log('BossScreen will unmount');
        console.log('removing BossScreen classes listener');
        this.unsubscribe && this.unsubscribe();
    }
    render() {
        return (
            <ThemeProvider theme={theme}>
                <ScrollView style={commonStyles.container}>
                    <NavigationEvents
                        onWillFocus={_ => this.onComponentFocus()}
                        onWillBlur={_ => this.onComponentBlur()}
                        onDidFocus={payload => console.log('BossScreen did focus', payload)}
                        onDidBlur={payload => console.log('BossScreen did blur', payload)}
                    />
                    <AddItem text='Add a class' onPress={() => this.onPress()} />
                    <View>
                        <Text style={commonStyles.headingText}>My classes{ this.state.userEmail ? ' (' + this.state.userEmail + ')' : ''}</Text>
                    </View>
                    <Divider />
                    <View>
                        { this.state.classList && this.state.classList.map((c, i) => (
                            <ListItem
                                key={i}
                                title={classTitle(c) + (c.bookings && c.bookings.length ? ` (${c.bookings.length} bookings)` : '')}
                                subtitle={classSubtitle(c)}
                                bottomDivider
                                chevron
                                onPress={() => this.props.navigation.navigate('ClassDetail', {class: c, bossMode: true})}
                            />
                        ))}
                        { this.state.classList && this.state.classList.length === 0 && <Text>No BOSSES</Text> }
                    </View>
                </ScrollView>
            </ThemeProvider>
        );
    }
    onPress() {
        this.props.navigation.navigate('NewClass', {userUID: this.state.userUID});
    }
}

BossScreen.navigationOptions = {
    title: 'Hey BOSS!',
};

export default withContext(BossScreen);