/*****************************
* environment.js
* path: '/environment.js' (root of your project)
******************************/

import { Constants } from 'expo';
import { Platform } from 'react-native';

const facebookConfig = {
    appId: 'XXX'
};

const firebaseConfig = {
    apiKey: 'XXX',
    authDomain: 'XXX',
    databaseURL: 'XXX',
    projectId: 'XXX',
    storageBucket: 'XXX',
    messagingSenderId: 'XXX',
    appId: 'XXX',
};

const stripeConfig = {
    stripe_publishable_key: 'XXX'
};

const ENV = {
    dev: {
        facebookConfig,
        firebaseConfig,
        stripeConfig
    },
    staging: {
        facebookConfig,
        firebaseConfig,
        stripeConfig
    },
    prod: {
        facebookConfig,
        firebaseConfig,
        stripeConfig
    }
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
 // What is __DEV__ ?
 // This variable is set to true when react-native is running in Dev mode.
 // __DEV__ is true when run locally, but false when published.
 if (__DEV__) {
   return ENV.dev;
 } else if (env === 'staging' || env === 'default') {
   return ENV.staging;
 } else if (env === 'prod') {
   return ENV.prod;
 }
};

export default getEnvVars;