import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import AuthStackNavigator from './AuthStackNavigator';
import MainTabNavigator from './MainTabNavigator';

export default createAppContainer(
  createSwitchNavigator({
    Auth: AuthStackNavigator,
    Main: MainTabNavigator,
  }, {
    initialRouteName: 'Auth'
  })
);
