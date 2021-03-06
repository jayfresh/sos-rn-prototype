import React from 'react';
import { View, ScrollView } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { Button, ListItem, Overlay, Text, ThemeProvider } from 'react-native-elements';

import { db, firebase } from '../config';
import { withContext } from '../common/context';
import commonStyles from '../common/styles';
import theme from '../common/theme';

class ClassDetailScreen extends React.Component {
    state = {
        userID: null,
        successOverlayVisible: false,
        class: null,
        classID: '',
        className: '',
        classDuration: '',
        classLocation: '',
        classBookings: null,
        classBookingCount: 0,
        booked: false,
        bossMode: false,
        mappedBookings: null
    };
    componentDidMount = () => {
        console.log('ClassDetailScreen did mount');
        const loggedInQueenId = firebase.auth().currentUser.uid;
        const c = this.props.navigation.getParam('class');
        const bossMode = this.props.navigation.getParam('bossMode');
        if (c) {
            this.setState({
                userID: loggedInQueenId,
                class: c,
                classID: c.id,
                className: c.name,
                classDuration: c.duration,
                classLocation: c.location,
                classBookings: c.bookings,
                classBookingCount: c.bookings ? c.bookings.length : 0,
                booked: c.bookings && c.bookings.includes(loggedInQueenId),
                bossMode
            });
            if (bossMode) {
                // pass in c.bookings, because we can't rely on setState having completed by now, it can be async
                this.refreshCustomerList(c.bookings);
            }
        }
    }
    onComponentFocus = () => {
        // the class detail screen is focussed not mounted when coming back from the checkout
        const loggedInQueenId = firebase.auth().currentUser.uid;
        const c = this.props.navigation.getParam('class');
        const checkoutSuccess = this.props.navigation.getParam('checkoutSuccess');
        console.log('ClassDetailScreen did focus, loggedInQueenId', loggedInQueenId);
        if (c && checkoutSuccess) {
            this.onCheckoutSuccess(c.id, loggedInQueenId); // provide the queen ID as the setState won't have completed by the time the function is called
        }
    }
    onPressSubmit = () => {
        this.props.navigation.navigate('Checkout', {
            class: this.state.class
        });
    };
    refreshCustomerList = bookingIds => {
        if (!bookingIds || !bookingIds.length) { return; }
        // filter out any nulls as you can't query with nulls in
        const bookingIdsForQuery = bookingIds.filter(id => id);
        // if there is no linked user for a booking for some reason, show it as "unknown"
        db.collection('users').where('linkedUID', 'in', bookingIdsForQuery)
        .get()
        .then(querySnapshot => {
            var mappedBookings = [];
            var customerMap = {};
            querySnapshot.forEach(doc => {
                // doc.data() is never undefined for query doc snapshots
                var data = doc.data();
                customerMap[data.linkedUID] = data;
            });
            // fill out the mappedBookings including where there has been no match in the users table
            bookingIds.forEach(id => {
                mappedBookings.push(customerMap[id] || null);
            });
            this.setState({
                mappedBookings
            });
        })
        .catch(error => {
            console.log('Error calling refreshCustomerList: ', error);
        });
    };
    onCheckoutSuccess = (classID, queenId) => {
        console.log('onCheckoutSuccess', classID, queenId);
        // update the class in the database with the customer ID
        // NB: WHAT WE'RE DOING HERE IS NOT GOOD PRACTICE
        // WE SHOULD PROCESS A WEBHOOK FROM STRIPE ON THE SERVER
        // AND USE THAT TO UPDATE THE CLASSES DOCUMENT
        var classRef = db.collection('classes').doc(classID);
        return classRef.update({
            bookings: firebase.firestore.FieldValue.arrayUnion(queenId)
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
        console.log('ClassDetail render');
        return (
            <ThemeProvider theme={theme}>
                <ScrollView style={commonStyles.container}>
                    <NavigationEvents
                        onWillFocus={payload => console.log('CDS will focus', payload)}
                        onWillBlur={payload => console.log('CDS will blur', payload)}
                        onDidFocus={() => this.onComponentFocus()}
                        onDidBlur={payload => console.log('CDS did blur', payload)}
                    />
                {
                        this.state.successOverlayVisible && (
                            <Overlay
                                isVisible
                                onBackdropPress={() => this.setState({ successOverlayVisible: false })}
                            >
                                <View style={{flex: 1, justifyContent: 'center'}}>
                                    <Text h3 style={commonStyles.overlayH3Text}>Class booked! See you on the dance floor</Text>
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
                        <Button
                            title={this.state.booked ? 'You\'re booked!' : 'Book class'}
                            type={this.state.booked ? 'clear' : 'solid'}
                            disabled={this.state.booked}
                            onPress={this.onPressSubmit}
                            loading={this.state.loading}
                        />
                        {this.state.bossMode && this.props.context.RoleManager.canBoss() && (
                            <View>
                                <Text style={commonStyles.headingText}>Bookings ({this.state.classBookingCount})</Text>
                                { this.state.mappedBookings && this.state.mappedBookings.map((b, i) => (
                                    <ListItem
                                        key={i}
                                        leftAvatar={b && { source: { uri: b.photoURL } }}
                                        title={b ? b.firstname + ' ' + b.lastname : 'Unknown'}
                                        subtitle={b && b.email}
                                        bottomDivider
                                    />
                                ))}
                                { this.state.classBookingCount === 0 && <Text style={[commonStyles.bodyText, {marginVertical: 20}]}>No bookings</Text> }
                            </View>
                        )}
                    </View>
                </ScrollView>
            </ThemeProvider>
        );
    }
}

export default withContext(ClassDetailScreen);