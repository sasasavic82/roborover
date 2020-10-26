import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faTimes, faMinus } from '@fortawesome/free-solid-svg-icons';
import { AuthenticatedRoutes } from './routes';

const history = createBrowserHistory();
library.add(faCheck, faTimes, faMinus);

const RoboroverApp = () => (
    <Router basename="/" history={history}>
          <Route component={AuthenticatedRoutes} />
    </Router>
);

export default RoboroverApp;
