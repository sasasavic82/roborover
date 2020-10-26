import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from '../views/authentication/login';
import Logout from '../views/authentication/logout';

const UnauthenticatedRoutes = () => {
  return (
    <Switch>
      <Route path="/" exact component={Login} />
      <Route path="/authentication/login" component={Login} />
      <Route path="/logout" component={Logout} />
    </Switch>
  );
};

export default UnauthenticatedRoutes;
