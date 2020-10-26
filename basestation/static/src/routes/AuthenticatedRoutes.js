import React from 'react';
import { Route, Switch } from 'react-router-dom';
import BasestationView from '../views/basestation/BasestationView';

const AuthenticatedRoutes = () => {
  return (
    <Switch>
      <Route path="/basestation" component={BasestationView} />
    </Switch>
  );
};
export default AuthenticatedRoutes;
