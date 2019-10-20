import React from 'react';
import { View, Text, ScrollView } from 'react-native';

import commonStyles from '../common/styles';

export default class QueensScreen extends React.Component {
  render() {
    return (
        <ScrollView style={commonStyles.container}>
            <View>
                <Text style={commonStyles.headingText}>Location</Text>
            </View>
        </ScrollView>
    );
  }
}

QueensScreen.navigationOptions = {
  title: 'Queens',
};
