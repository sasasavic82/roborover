import React, { useState, useEffect } from 'react';
import ObjectID from 'bson-objectid';
import {
  AuthenticationDetails,
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
} from 'amazon-cognito-identity-js'; // https://github.com/aws-amplify/amplify-js/tree/67fac50cd734338ac76797d06111fc5ca911bd48/packages/amazon-cognito-identity-js
import AuthContext from './auth.context';
import { isOfflineEnvironment } from '../../helpers';
import { changePasswordErrorMapper } from './_helper';

const _cognitoUserPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_AWS_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_AWS_COGNITO_USER_POOL_APP_CLIENT_ID,
});

const _getCognitoSession = (cognitoUserCache, callback) => {
  cognitoUserCache.getSession((err, _session) => {
    if (err) {
      console.log(err);
      callback(err);
    }

    if (_session && _session.isValid()) {
      callback(null, _session);
    }
  });
};

const AuthProvider = ({ children }) => {
  const _cognitoUserCache = _cognitoUserPool.getCurrentUser();

  const [authenticated, setAuthenticated] = useState(!!_cognitoUserCache);
  const [cognitoUser, setCognitoUser] = useState(null);
  const [session, setSession] = useState(null); // https://github.com/aws-amplify/amplify-js/blob/67fac50cd734338ac76797d06111fc5ca911bd48/packages/amazon-cognito-identity-js/src/CognitoUserSession.js
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (_cognitoUserCache !== null) {
      _getCognitoSession(_cognitoUserCache, (err, _session) => {
        if (err) setAuthenticated(false);
        if (_session) _storeAuth(_session, _cognitoUserCache);
        setLoading(false);
      });
    } else setLoading(false);
  }, []);

  const _storeAuth = (authPayload, _cognitoUser) => {
    setSession(authPayload);
    setId(authPayload.getIdToken().payload['cognito:username']);
    setAuthenticated(true);
    setCognitoUser(_cognitoUser);
  };

  const login = (username, password) => {
    // For development and offline use
    if (isOfflineEnvironment()) {
      if (username === 'test@test.com' && password === 'test123') {
        // TODO: set to something proper
        _storeAuth({});
        return Promise.resolve();
      }
      return Promise.reject(new Error('Username or password is incorrect'));
    }

    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const _cognitoUser = new CognitoUser({
      Username: username,
      Pool: _cognitoUserPool,
    });

    return new Promise((resolve, reject) => {
      _cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess(result) {
          _storeAuth(result, _cognitoUser);
          resolve(result);
        },
        onFailure(error) {
          reject(error);
        },
      });
    });
  };

  const register = (email, password, name, hasInvitation) => {
    const attributeList = [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'name',
        Value: name,
      },
    ];

    if (hasInvitation) {
      attributeList.push({
        Name: 'custom:invited',
        Value: 'true',
      });
    }

    const cognitoAttributeList = attributeList.map(
      (attribute) => new CognitoUserAttribute(attribute),
    );

    return new Promise((resolve, reject) => {
      // Using uuidv4 as username with email as alias
      _cognitoUserPool.signUp(
        ObjectID(),
        password,
        cognitoAttributeList,
        null,
        (err, result) => {
          if (err) {
            alert(err.message || JSON.stringify(err));
            reject(err);
          }

          resolve(result.user);
        },
      );
    });
  };

  const logout = () => {
    cognitoUser && cognitoUser.clearCachedUser();
    setSession(null);
    setId(null);
    setCognitoUser(null);
    setAuthenticated(false);
  };

  const changePassword = (currentPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      try {
        cognitoUser.changePassword(currentPassword, newPassword, (err) => {
          if (err) reject(changePasswordErrorMapper(err));
          else resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const refreshSession = () => {
    return new Promise((resolve, reject) => {
      _getCognitoSession(_cognitoUserCache, (err, _session) => {
        if (err) {
          setAuthenticated(false);
          reject(err);
        }
        if (_session) {
          _storeAuth(_session, _cognitoUserCache);
          resolve();
        }
      });
    });
  };

  /**
   * 
   * Checks of access and id tokens are still valid based on current time and expiry of tokens
   * 
   * Both access and id tokens must be valid to return true 
   * 
   * @returns {boolean} if access and id tokens are valid
   */
  const isValidToken = () => {
    return session.isValid();
    // return false;
  };

  // render components after loading
  // TODO: render a nice loading
  return (
    !loading && (
      <AuthContext.Provider
        value={{
          authenticated,
          id,
          login,
          register,
          logout,
          changePassword,
          refreshSession,
          isValidToken,
          idToken: session ? session.idToken.jwtToken : null
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  );
};

export default AuthProvider;
