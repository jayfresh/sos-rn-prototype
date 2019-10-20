import React from 'react';
import { View, Text, ScrollView } from 'react-native';

import commonStyles from '../common/styles';

export default class NewTeacherScreen extends React.Component {
    render() {
        return (
            <ScrollView style={commonStyles.container}>
                <View>
                    <Text style={commonStyles.headingText}>Use this screen to add a new teacher</Text>
                </View>
            </ScrollView>
        );
    }
}