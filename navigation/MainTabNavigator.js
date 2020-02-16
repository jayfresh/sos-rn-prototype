import React from 'react';
import { Platform } from 'react-native';
import { Image } from 'react-native-elements';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import Colors from '../common/colors';
import HeaderIcon from '../components/HeaderIcon';
import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import NewBossScreen from '../screens/NewBossScreen';
import NewClassScreen from '../screens/NewClassScreen';
import BossScreen from '../screens/BossScreen';
import QueensScreen from '../screens/QueensScreen';
import ClassDetailScreen from '../screens/ClassDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.pop,    
      },
      headerTitleStyle: {
        color: Colors.white,
        fontFamily: 'archivo-black',
        textTransform: 'uppercase',
      },
      headerRight: (
        <HeaderIcon />
      ),
    }
  },
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
    NewBoss: NewBossScreen,
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
      ClassDetail: ClassDetailScreen,
      NewClass: NewClassScreen
  },
  config
);

BossStack.navigationOptions = {
  tabBarLabel: 'BOSS',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={'fearless_woman'} />
  ),
};

BossStack.path = '';

const QueensStack = createStackNavigator(
  {
      Queens: QueensScreen,
      ClassDetail: ClassDetailScreen,
      Checkout: CheckoutScreen
  },
  config
);

QueensStack.navigationOptions = ({navigation}) => {
    const parent = navigation.dangerouslyGetParent();
    // switch on single tab view mode (no tabs showing) if neither isAdmin nor isBoss are active roles
    const singleTabView =
      parent &&
      parent.state &&
      parent.state.params &&
      !parent.state.params.isAdmin &&
      !parent.state.params.isBoss;
    return {
        tabBarLabel: 'Queens',
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} name={'sos_crown'} />
        ),
        tabBarVisible: !singleTabView
    };
};

QueensStack.path = '';

const TabNavigator = createBottomTabNavigator({
  HomeStack,
  BossStack,
  QueensStack,
}, {
    resetOnBlur: true,
    tabBarOptions: {
        activeTintColor: Colors.pop,
        labelStyle: {
            fontFamily: 'montserrat',
        }
    }
});

TabNavigator.path = '';

// We're creating a custom navigator that wraps the TabNavigator, so the visible tabs can be dependent on role
// See the docs here for creating custom navigators: https://reactnavigation.org/docs/en/custom-navigators.html
// This GitHub issue shows this feature is a "heated" issue (at least prior to React Navigation 5.0):
// https://github.com/react-navigation/react-navigation/issues/717
class CustomNavigator extends React.Component {
    static router = TabNavigator.router;
    constructor(props) {
        super(props);
        this.isAdmin = props.navigation.getParam('isAdmin', false);
        this.isBoss = props.navigation.getParam('isBoss', false);
    }
    render() {
        const { navigation } = this.props;
        const navState = navigation.state;
        const filteredRoutes = navState.routes.filter(r => {
            if (r.routeName === 'HomeStack') {
                return this.isAdmin;
            }
            if (r.routeName === 'BossStack') {
                return this.isBoss;
            }
            return true;
        });
        const activeIndex = navState.index;
        const activeRoute = navState.routes[activeIndex];
        let filteredActiveIndex = filteredRoutes.findIndex(route => route.routeName === activeRoute.routeName);
        // When the app loads, the active route is index 0, which is HomeStack.
        // This might not be in filtered routes, so default filteredActiveIndex to 0
        if (filteredActiveIndex === -1) { filteredActiveIndex = 0 };
        const newNavigation = {
          ...navigation,
          state: {
            ...navState,
            routes: filteredRoutes,
            index: filteredActiveIndex,
          }
        };
        return <TabNavigator navigation={newNavigation} />;
    }
}

export default CustomNavigator;