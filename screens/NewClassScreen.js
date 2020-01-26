import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Input, Overlay, Text, ThemeProvider } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';

import { db, firebase } from '../config';
import Colors from '../common/colors';
import commonStyles from '../common/styles';
import theme from '../common/theme';

const moment = require('moment-timezone');
const DEFAULT_CLASS_TYPE = 'SOS BOSS';

const addClass = function(data) {
    // make a datetime and duration from the date and time components
    const DATE_FORMAT = 'YYYY-MM-DD HH:mm';
    const startTime = moment(data.selectedDate + ' ' + data.startTime, DATE_FORMAT);
    const endTime = moment(data.selectedDate + ' ' + data.endTime, DATE_FORMAT);
    const duration = endTime.diff(startTime, 'minutes');
    return db.collection('classes').add({
        name: data.name,
        location: data.location,
        startTime: startTime.toDate(),
        duration: duration,
        instructor: data.userUID,
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
        userUID: null,
        name: '',
        location: '',
        selectedDate: null,
        startTime: '',
        endTime: ''
    };
    componentDidMount() {
        console.log('NewClassScreen did mount');
        const userUID = this.props.navigation.getParam('userUID', null) || (firebase.auth().currentUser && firebase.auth().currentUser.uid);
        // retrieve the BOSS's name so we can use it in the class name
        db.collection('users').where('linkedUID', '==', userUID)
        .get()
        .then(querySnapshot => {
            if (querySnapshot.length < 1) {
                throw new Error('no matching Users found for UID ' + userUID);
            }
            querySnapshot.forEach(doc => {
                const bossName = doc.data().firstname
                this.setState({
                    userUID,
                    bossName
                });
            });
        })
        .catch(error => {
            console.log('Error getting BOSS user: ', error);
        });
    }
    defaultClassName = () => this.state.bossName ? DEFAULT_CLASS_TYPE + ' with ' + this.state.bossName : DEFAULT_CLASS_TYPE;
    clearForm = () => {
        this.setState({
            name: this.defaultClassName(),
            location: '',
            datetime: '',
            selectedDate: null,
            startTime: '',
            endTime: ''
        });
    };
    onPressSubmit = () => {
        this.setState({loading: true});
        // save to Firebase
        addClass(this.state)
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
                    <Text h3 style={[commonStyles.headingText, {marginBottom: 20}]}>Add a new class</Text>
                    <ThemeProvider theme={theme}>
                        <Input
                            label='Class name'
                            disabled={true}
                            disabledInputStyle={{color: Colors.black, opacity: 1}}
                            placeholder={DEFAULT_CLASS_TYPE}
                            value={this.defaultClassName()}
                            onChangeText={text => this.setState({name: text})}
                        />
                        <Input
                            label='Location'
                            placeholder='Dance Academy, 1 Main Street, NA1 1AA'
                            value={this.state.location}
                            onChangeText={text => this.setState({location: text})}
                        />
                        <Calendar
                            // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
                            minDate={Date()}
                            // Marked dates affects which date shows up as selected on the calendar
                            markedDates={{ [this.state.selectedDate]: { selected: true, selectedColor: 'red' } }}
                            // Handler which gets executed on day press. Default = undefined
                            onDayPress={day => { this.setState({selectedDate: day.dateString}); }}
                            // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                            monthFormat={'MMM yyyy'}
                            // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                            firstDay={1}
                            // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                            onPressArrowLeft={subtractMonth => subtractMonth()}
                            // Handler which gets executed when press arrow icon right. It receive a callback can go next month
                            onPressArrowRight={addMonth => addMonth()}
                            // Theme overrides
                            theme={{
                                // backgroundColor: '#ffffff',
                                // calendarBackground: '#ffffff',
                                // textSectionTitleColor: '#b6c1cd',
                                // selectedDayBackgroundColor: '#00adf5',
                                // selectedDayTextColor: '#ffffff',
                                todayTextColor: Colors.pop,
                                // dayTextColor: '#2d4150',
                                // textDisabledColor: '#d9e1e8',
                                // dotColor: '#00adf5',
                                // selectedDotColor: '#ffffff',
                                arrowColor: Colors.pop,
                                // disabledArrowColor: '#d9e1e8',
                                // monthTextColor: 'blue',
                                // indicatorColor: 'blue',
                                // textDayFontFamily: 'monospace',
                                // textMonthFontFamily: 'monospace',
                                // textDayHeaderFontFamily: 'monospace',
                                // textDayFontWeight: '300',
                                // textMonthFontWeight: 'bold',
                                // textDayHeaderFontWeight: '300',
                                // textDayFontSize: 16,
                                // textMonthFontSize: 16,
                                // textDayHeaderFontSize: 16
                            }}
                        />
                        <Input
                            label='Start time'
                            placeholder='18:30'
                            value={this.state.startTime}
                            onChangeText={text => this.setState({startTime: text})}
                        />
                        <Input
                            label='End time'
                            placeholder='19:30'
                            value={this.state.endTime}
                            onChangeText={text => this.setState({endTime: text})}
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