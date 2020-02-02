import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { withTheme } from 'react-native-elements';
import Touchable from 'react-native-platform-touchable';

import TabBarIcon from '../components/TabBarIcon';

class AddItem extends React.Component {
    render() {
        const { theme } = this.props;
        return (
            <View>
                <Touchable
                style={styles.option}
                background={Touchable.Ripple('#ccc', false)}
                onPress={this.props.onPress || this._handlePressAddItem}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={styles.optionIconContainer}>
                        <TabBarIcon name={Platform.OS === 'ios' ? 'ios-add-circle-outline' : 'md-add-circle-outline'} />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={[theme.Text.style, styles.optionText]}>{this.props.text}</Text>
                    </View>
                </View>
                </Touchable>
            </View>
        );
    }
}

_handlePressAddItem = () => {
    console.log('Pressed add item');
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

export default withTheme(AddItem);