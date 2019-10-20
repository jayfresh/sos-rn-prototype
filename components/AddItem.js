import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Touchable from 'react-native-platform-touchable';

import TabBarIcon from '../components/TabBarIcon';

export default class AddItem extends React.Component {
    render() {
        return (
            <View>
                <Touchable
                style={styles.option}
                background={Touchable.Ripple('#ccc', false)}
                onPress={this._handlePressAddClass}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={styles.optionIconContainer}>
                        <TabBarIcon name={Platform.OS === 'ios' ? 'ios-add-circle-outline' : 'md-add-circle-outline'} />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionText}>{this.props.text}</Text>
                    </View>
                </View>
                </Touchable>
            </View>
        );
    }
}

_handlePressAddClass = () => {
    console.log('Pressed add class');
};

const styles = StyleSheet.create({
  optionIconContainer: {
    marginRight: 9,
  },
  option: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  optionTextContainer: {},
  optionText: {
    fontSize: 15,
    marginTop: 1,
  },
});