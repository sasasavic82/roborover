import React, { useContext } from 'react';

import { ApolloClient } from 'apollo-client';
import { useHistory } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { RetryLink } from 'apollo-link-retry';
import AuthContext from '../../contexts/auth/auth.context';

const uploadLink = createUploadLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT_URL,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${
          typeof locations === 'object' ? JSON.stringify(locations) : locations
        }, Path: ${path}`,
      ),
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const ApolloWrapper = ({ children }) => {
  const history = useHistory();
  const { logout, refreshSession, isValidToken, idToken } = useContext(AuthContext);

  const retryLink = new RetryLink({
    delay: {
      initial: 0,
    },
    attempts: {
      max: 2,
      retryIf: async (err) => {
        // when unauthorize response from server, logout
        if ([401, 403].includes(err.statusCode)) {
          history.push('/logout')
          return true;
        }
        return true;
      },
    },
  });

  const authLink = setContext((_, { headers }) => {
    if (isValidToken()) {
      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          Authorization: idToken ? `${idToken}` : ''
        }
      };
    } else {
      // invalid token, logout user
      history.push('/logout');
    }
  });

  const client = new ApolloClient({
    link: errorLink.concat(retryLink).concat(authLink).concat(uploadLink),
    cache: new InMemoryCache()
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloWrapper;
