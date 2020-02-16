import React, { createContext } from 'react'
import RoleManager from './RoleManager';

const AppContext = createContext({});

export const ContextProvider = AppContext.Provider;

export const ContextConsumer = AppContext.Consumer;

export const withContext = Component => props => (
  <ContextConsumer>
    {value => <Component {...props} context={value} />}
  </ContextConsumer>
);

export const context = {
    RoleManager
};