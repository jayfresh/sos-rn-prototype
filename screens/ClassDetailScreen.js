import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Input, Overlay, Text, ThemeProvider } from 'react-native-elements';

import { db, firebase } from '../config';
import commonStyles from '../common/styles';
import theme from '../common/theme';

const TEST_QUEEN_ID = 'testUserID';

export default class ClassDetailScreen extends React.Component {
    state = {
        userID: TEST_QUEEN_ID,
        successOverlayVisible: false,
        classID: '',
        className: '',
        classDuration: '',
        classLocation: '',
        classBookings: '',
        booked: false
    };
    componentDidMount = () => {
        const c = this.props.navigation.getParam('class');
        console.log('class param', c);
        if (c) {
            this.setState({
                classID: c.id,
                className: c.name,
                classDuration: c.duration,
                classLocation: c.location,
                classBookings: c.bookings && c.bookings.length,
                booked: c.bookings && c.bookings.includes(TEST_QUEEN_ID)
            });
        }
    }
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
                    <Text style={commonStyles.bodyText}>Location: {this.state.classLocation}</Text>
                    <Text style={commonStyles.bodyText}>Duration: {this.state.classDuration} minutes</Text>
                    <ThemeProvider theme={theme}>
                        <Button
                            title={this.state.booked ? 'You\'re booked' : 'Book class'}
                            type={this.state.booked ? 'clear' : 'solid'}
                            disabled={this.state.booked}
                            onPress={this.onPressSubmit}
                            loading={this.state.loading}
                        />
                    </ThemeProvider>
                </View>
            </ScrollView>
        );
    }
}