import React from 'react';
import { TextInput, View, ScrollView } from 'react-native';
import { Button, Input, Overlay, Text, ThemeProvider } from 'react-native-elements';

import { db } from '../config';
import commonStyles from '../common/styles';
import theme from '../common/styles';

const addUser = function(data) {
    return db.collection('users').add({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email
    })
    .then(function(docRef) {
        console.log('Document written with ID: ', docRef.id);
    })
    .catch(function(error) {
        console.error('Error adding document: ', error);
    });
};

export default class NewBossScreen extends React.Component {
    state = {
        loading: false,
        firstname: '',
        lastname: '',
        email: '',
        successOverlayVisible: false
    };
    clearForm = () => {
        this.setState({
            firstname: '',
            lastname: '',
            email: ''
        });
    };
    onPressSubmit = () => {
        this.setState({loading: true});
        // save to Firebase
        addUser({
            firstname: this.state.firstname,
            lastname: this.state.lastname,
            email: this.state.email
        })
        .then(_ => {
            this.clearForm();
            this.setState({
                loading: false,
                successOverlayVisible: true
            });
        });
    };
    backToAdminPress = () => {
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
                                <Text h3 style={commonStyles.overlayH3Text}>BOSS added!</Text>
                                <Button
                                    title='Back to admin'
                                    onPress={this.backToAdminPress}
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
                    <Text h3 style={[commonStyles.headingText, {marginBottom: 20}]}>Add a new BOSS</Text>
                    <ThemeProvider theme={theme}>
                        <Input
                            label='First name'
                            placeholder='Beyoncé'
                            value={this.state.firstname}
                            onChangeText={text => this.setState({firstname: text})}
                        />
                        <Input
                            label='Last name'
                            placeholder='Knowles'
                            value={this.state.lastname}
                            onChangeText={text => this.setState({lastname: text})}
                        />
                        <Input
                            label='Email address'
                            placeholder='queen@beyonceknowles.com'
                            rightIcon={{ name: 'email', type: 'material' }}
                            value={this.state.email}
                            keyboardType='email-address'
                            onBlur={() => this.setState({email: this.state.email.toLowerCase()})}
                            onChangeText={text => this.setState({email: text})}
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