import React, { createContext } from 'react'

const Context = createContext({});

export const ContextProvider = Context.Provider;

export const ContextConsumer = Context.Consumer;

export const withContext = Component => props => (
  <ContextConsumer>
    {state => <Component {...props} context={state} />}
  </ContextConsumer>
);