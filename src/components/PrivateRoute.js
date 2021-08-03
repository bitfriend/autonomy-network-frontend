import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (!rest.web3Provider && props.location.pathname !== '/') ? (
      <Redirect from={props.location.pathname} to="/" />
    ) : (
      <Component {...props} />
    )}
  />
);

const mapStateToProps = ({ app }) => ({
  web3Provider: app.web3Provider
});

export default connect(mapStateToProps)(PrivateRoute);
