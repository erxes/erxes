import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';

type Props = {
  savedPluginsQuery: any;
};

const withSavedPlugins = (Component) => {
  const Container = (props: Props) => {
    const { savedPluginsQuery } = props;

    if (savedPluginsQuery.loading) {
      return <Spinner />;
    }

    const extendedProps = {
      ...props,
      savedPlugins: savedPluginsQuery.savedPlugins || [],
    };

    return <Component {...extendedProps} />;
  };

  return compose(
    graphql(gql(queries.savedPlugins), {
      name: 'savedPluginsQuery',
      options: {
        fetchPolicy: 'network-only',
        variables: { mainType: 'plugin' },
      },
    }),
  )(Container);
};

export default withSavedPlugins;
