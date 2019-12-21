import React from 'react';
import { WebView } from 'react-native-webview';
import { stripeCheckoutRedirectHTML } from './stripeCheckout';
import getEnvVars from '../../environment';
const { stripeConfig } = getEnvVars();

class CheckoutScreen extends React.Component {

    // TODO: this should come from some service/state store
    user = { id: 'someID' };

    // Called everytime the URL starts to load in the webview
    onLoadStart = (syntheticEvent) => {
        const c = this.props.navigation.getParam('class');
        const { nativeEvent } = syntheticEvent;
        console.log(nativeEvent.url);
        if (nativeEvent.url.indexOf(stripeConfig.success_url) !== -1) {
            this.props.navigation.navigate('ClassDetail', {
                checkoutSuccess: true,
                class: c
            });
            return;
        }
        if (nativeEvent.url.indexOf(stripeConfig.cancel_url) !== -1) {
            this.props.navigation.navigate('ClassDetail', {
                class: c
            });
            return;
        }
    };

    render() {
        if (!this.user) {
            return null;
        }
        return (
            <WebView
                originWhitelist={['*']}
                source={{ html: stripeCheckoutRedirectHTML(this.user.id) }}
                onLoadStart={(e) => this.onLoadStart(e)}
            />
        );
    }
};

export default CheckoutScreen;