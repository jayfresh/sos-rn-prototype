import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Input, Overlay, Text, ThemeProvider } from 'react-native-elements';

import { db, firebase } from '../config';
import commonStyles from '../common/styles';
import theme from '../common/theme';

export default class ClassDetailScreen extends React.Component {
    state = {
        userID: 'testUserID',
        successOverlayVisible: false,
        classID: '5PnhbRWeVu2KysBZoyDQ',
        className: 'test class',
        classDuration: '45 minutes',
        classLocation: '1 Summerfield Place, Abercrombie, S1 4LT'
    };
    onPressSubmit = () => {
        // update the class in the database with the customer ID
        var classRef = db.collection('classes').doc(this.state.classID);
        return classRef.update({
            bookings: firebase.firestore.FieldValue.arrayUnion(this.state.userID)
        })
        .then(() => {
            console.log('Booking added');
            this.setState({
                successOverlayVisible: true
            });
        })
        .catch(error => {
            // The document probably doesn't exist.
            console.error('Error adding booking', error);
        });
    };
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
                    <Text style={commonStyles.bodyText}>{this.state.classDuration}</Text>
                    <Text style={commonStyles.bodyText}>{this.state.classLocation}</Text>
                    <ThemeProvider theme={theme}>
                        <Button
                            title='Book class'
                            onPress={this.onPressSubmit}
                            loading={this.state.loading}
                        />
                    </ThemeProvider>
                </View>
            </ScrollView>
        );
    }
}