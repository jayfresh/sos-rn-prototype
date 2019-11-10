import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Input, Overlay, Text, ThemeProvider } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';

import { db } from '../config';
import commonStyles from '../common/styles';
import theme from '../common/theme';

export default class ClassDetailScreen extends React.Component {
    state = {
        successOverlayVisible: false,
        className: 'test class'
    };
    onPressSubmit = () => {};
    backButtonPress = () => {
        this.props.navigation.goBack();
    };
    render() {
        return (
            <ScrollView style={commonStyles.container}>
            {
                    this.state.successOverlayVisible && (
                        <Overlay
                            isVisible
                            onBackdropPress={() => this.setState({ successOverlayVisible: false })}
                        >
                            <View style={{flex: 1, justifyContent: 'center'}}>
                                <Text h3 style={commonStyles.overlayH3Text}>Class booked!</Text>
                                <Button
                                    title='Back to class list'
                                    onPress={this.backButtonPress}
                                    containerStyle={commonStyles.overlayButton}
                                />
                            </View>
                        </Overlay>
                    )
                }
                <View>
                    <Text h3 style={[commonStyles.headingText, {marginBottom: 20}]}>{this.state.className}</Text>
                    <Button
                        title="Submit"
                        onPress={this.onPressSubmit}
                        loading={this.state.loading}
                    />
                </View>
            </ScrollView>
        );
    }
}