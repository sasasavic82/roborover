import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import AuthContext from '../contexts/auth/auth.context';


export const PrivateRoute = ({ component: Component, ...rest }) => {
    const { authenticated } = useContext(AuthContext);

    return (
        <Route {...rest} render={props => {
            if (!authenticated) {
                // not logged in so redirect to login page with the return url
                return <Redirect to={{ pathname: '/authentication/login', state: { from: props.location } }} />
            }

            // authorised so return component
            return <Component {...props} />
        }} />
    )
};

export default PrivateRoute;