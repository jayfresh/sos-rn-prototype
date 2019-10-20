import React from 'react';
import { View, ScrollView, Text } from 'react-native';

import AddItem from '../components/AddItem';
import commonStyles from '../common/styles';

export default class BossScreen extends React.Component {
  render() {
    return (
        <ScrollView style={commonStyles.container}>
            <AddItem text='Add a class' onPress={() => this.onPress()} />
            <View>
                <Text style={commonStyles.headingText}>My classes</Text>
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