import React from 'react';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../common/colors';

export default function TabBarIcon(props) {
    switch (props.name) {
        case 'sos_crown': {
            return (
                <Image
                    source={require('../assets/images/sos_crown_icon.png')}
                    style={{height: 40, width: 40}}
                />
            );
        }
        case 'fearless_woman': {
            return (
                <Image
                    source={require('../assets/images/fearless_woman.png')}
                    style={{height: 30, width: 12}}
                />
            );
        }
        default: {
            return (
                <Ionicons
                    name={props.name}
                    size={26}
                    style={{ marginBottom: -3 }}
                    color={props.focused ? Colors.pop : Colors.black}
                />
            );
        }
    }
}
