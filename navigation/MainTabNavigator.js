import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import NewTeacherScreen from '../screens/NewTeacherScreen';
import NewClassScreen from '../screens/NewClassScreen';
import BossScreen from '../screens/BossScreen';
import QueensScreen from '../screens/QueensScreen';
import SettingsScreen from '../screens/SettingsScreen';

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
    NewTeacher: NewTeacherScreen,
  },
  config
);

HomeStack.navigationOptions = {
  tabBarLabel: 'Admin',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-school' : 'md-school'}
    />
  ),
};

HomeStack.path = '';

const BossStack = createStackNavigator(
  {
      Boss: BossScreen,
      NewClass: NewClassScreen,
  },
  config
);

BossStack.navigationOptions = {
  tabBarLabel: 'Boss',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-rocket' : 'md-rocket'} />
  ),
};

BossStack.path = '';

const QueensStack = createStackNavigator(
  {
      Queens: QueensScreen,
  },
  config
);

QueensStack.navigationOptions = {
  tabBarLabel: 'Queens',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-flame' : 'md-flame'} />
  ),
};

QueensStack.path = '';

const tabNavigator = createBottomTabNavigator({
  HomeStack,
  BossStack,
  QueensStack,
});

tabNavigator.path = '';

export default tabNavigator;
