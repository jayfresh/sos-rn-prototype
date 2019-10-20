import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExpoConfigView } from '@expo/samples';

import commonStyles from '../common/styles';

export default function SettingsScreen() {
  /**
   * Go ahead and delete ExpoConfigView and replace it with your content;
   * we just wanted to give you a quick view of your config.
   */
  return <ExpoConfigView />
}

SettingsScreen.navigationOptions = {
  title: 'Settings',
};
