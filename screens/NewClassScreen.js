import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Input, Overlay, Text, ThemeProvider } from 'react-native-elements';

import { db } from '../config';
import commonStyles from '../common/styles';
import theme from '../common/theme';

const addClass = function(data) {
    return db.collection('classes').add({
        name: data.name,
        location: data.location,
        datetime: data.datetime,
        instructor: 'TESTID',
        weeklyRecurring: true
    })
    .then(function(docRef) {
        console.log('Document written with ID: ', docRef.id);
    })
    .catch(function(error) {
        console.error('Error adding document: ', error);
    });
};

export default class NewClassScreen extends React.Component {
    state = {
        loading: false,
        name: '',
        location: '',
        datetime: ''
    };
    clearForm = () => {
        this.setState({
            name: '',
            location: '',
            datetime: ''
        });
    };
    onPressSubmit = () => {
        this.setState({loading: true});
        // save to Firebase
        addClass({
            name: this.state.name,
            location: this.state.location,
            datetime: this.state.datetime
        })
        .then(_ => {
            this.clearForm();
            this.setState({
                loading: false,
                successOverlayVisible: true
            });
        });
    };
    backButtonPress = () => {
        this.addMoreButtonPress();
        this.props.navigation.goBack();
    };
    addMoreButtonPress = () => {
        this.setState({
            successOverlayVisible: false
        });
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
                                <Text h3 style={commonStyles.overlayH3Text}>Class added!</Text>
                                <Button
                                    title='Back to class list'
                                    onPress={this.backButtonPress}
                                    containerStyle={commonStyles.overlayButton}
                                />
                                <Button
                                    title='Add more'
                                    type='outline'
                                    onPress={this.addMoreButtonPress}
                                    containerStyle={commonStyles.overlayButton}
                                />
                            </View>
                        </Overlay>
                    )
                }
                <View>
                    <Text style={commonStyles.headingText}>Use this screen to add a new class</Text>
                    <ThemeProvider theme={theme}>
                        <Input
                            label='Class name'
                            placeholder='SOS Boss'
                            value={this.state.name}
                            onChangeText={text => this.setState({name: text})}
                        />
                        <Input
                            label='Location'
                            placeholder='Dance Academy, 1 Main Street, NA1 1AA'
                            value={this.state.location}
                            onChangeText={text => this.setState({location: text})}
                        />
                        <Input
                            label='Date and time'
                            placeholder='05/01/2020 18:30'
                            value={this.state.datetime}
                            onChangeText={text => this.setState({datetime: text})}
                        />
                        <Button
                            title="Submit"
                            onPress={this.onPressSubmit}
                            loading={this.state.loading}
                        />
                    </ThemeProvider>
                </View>
            </ScrollView>
        );
    }
}