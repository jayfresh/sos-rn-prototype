import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React from 'react';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ContextProvider, context } from './common/context';
import AppNavigator from './navigation/AppNavigator';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoadingComplete: false,
            RoleManager: context.RoleManager
        };
    }
    setLoadingComplete() {
        this.setState({
            isLoadingComplete: true
        });
    }
    render() {
        if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
          return (
            <AppLoading
              startAsync={loadResourcesAsync}
              onError={handleLoadingError}
              onFinish={() => this.setLoadingComplete()}
            />
          );
        } else {
          return (
            <KeyboardAvoidingView behavior='padding' style={styles.container}>
              {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
              <ContextProvider value={this.state}>
                  <AppNavigator />
              </ContextProvider>
            </KeyboardAvoidingView>
          );
        }
    }
}

async function loadResourcesAsync() {
  await Promise.all([
    Asset.loadAsync([
      require('./assets/images/fearless_woman.png'),
      require('./assets/images/sos_crown_icon.png'),
      require('./assets/images/sos_icon_white.png'),
      require('./assets/images/sos_icon.png'),
    ]),
    Font.loadAsync({
      // This is the font that we are using for our tab bar
      ...Ionicons.font,
      // We include SpaceMono because we use it in HomeScreen.js. Feel free to
      // remove this if you are not using it in your app
      'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      'archivo-black': require('./assets/fonts/ArchivoBlack-Regular.ttf'),
      'montserrat': require('./assets/fonts/Montserrat-Regular.ttf'),
    }),
  ]);
}

function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;