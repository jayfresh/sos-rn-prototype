import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import { db } from '../config';
import commonStyles from '../common/styles';
import { formatDate } from '../common/utilities';

let list = null;

export default class QueensScreen extends React.Component {
    unsubscribe = null;
    state = {
        classList: list
    };
    // Note: may need to use componentWillFocus / componentWillBlur as with BossScreen
    componentDidMount() {
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
    componentWillUnmount() {
        this.unsubscribe && this.unsubscribe();
    }
    render() {
        return (
            <ScrollView style={commonStyles.container}>
                <View>
                    <Text style={commonStyles.headingText}>Classes</Text>
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
