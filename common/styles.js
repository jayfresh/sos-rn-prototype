import {
  StyleSheet
} from 'react-native';
import Colors from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bodyText: {
      marginLeft: 15
  },
  headingText: {
    fontSize: 16,
    fontFamily: 'archivo-black',
    textTransform: 'uppercase',
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  overlayH3Text: {
      marginBottom: 40,
  },
  overlayButton: {
      marginVertical: 20
  }
});