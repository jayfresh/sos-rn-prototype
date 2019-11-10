import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { Divider, ListItem } from 'react-native-elements';

import { db } from '../config';
import AddItem from '../components/AddItem';
import commonStyles from '../common/styles';
import { formatDate } from '../common/utilities';

export default class BossScreen extends React.Component {
    unsubscribe = null;
    state = {
        classList: null
    };
    onComponentFocus() {
        const userEmail = this.props.navigation.getParam('userEmail', '');
        console.log('userEmail param:', userEmail);
        this.unsubscribe = db.collection('classes').orderBy('startTime')
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
    }
    onComponentBlur() {
        this.unsubscribe && this.unsubscribe();
    }
    render() {
        return (
            <ScrollView style={commonStyles.container}>
                <NavigationEvents
                    onWillFocus={_ => this.onComponentFocus()}
                    onWillBlur={_ => this.onComponentBlur()}
                />
                <AddItem text='Add a class' onPress={() => this.onPress()} />
                <View>
                    <Text style={commonStyles.headingText}>My classes</Text>
                </View>
                <Divider />
                <View>
                    { this.state.classList && this.state.classList.map((c, i) => (
                        <ListItem
                            key={i}
                            title={c.name + ' @ ' + c.location}
                            subtitle={formatDate(c.startTime) + ' / ' + c.duration + ' minutes'}
                            bottomDivider
                        />
                    ))}
                    { this.state.classList && this.state.classList.length === 0 && <Text>No teachers</Text> }
                </View>
            </ScrollView>
        );
    }
    onPress() {
        this.props.navigation.navigate('NewClass');
    }
}

BossScreen.navigationOptions = {
    title: 'Boss',
};