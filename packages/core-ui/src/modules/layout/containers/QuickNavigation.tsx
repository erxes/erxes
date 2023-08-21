import client from 'apolloClient';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import { Alert, getCookie, setCookie, withProps } from 'modules/common/utils';
import { queries as generalQueries } from '@erxes/ui-settings/src/general/graphql';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import QuickNavigation from '../components/QuickNavigation';

type Props = {
  getEnvQuery: any;
  currentUser: IUser;
};

type State = {
  selectedBrands: string[];
};

class QuickNavigationContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const cookieValue = getCookie('scopeBrandIds');

    this.state = { selectedBrands: cookieValue ? JSON.parse(cookieValue) : [] };
  }

  logout = () => {
    client
      .mutate({
        mutation: gql`
          mutation {
            logout
          }
        `
      })

      .then(() => {
        window.location.href = '/';
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  setValues = (selectedBrands: string[]) => {
    this.setState({ selectedBrands }, () => {
      setCookie('scopeBrandIds', JSON.stringify(this.state.selectedBrands));
      window.location.reload();
    });
  };

  onChangeBrands = (value: string) => {
    const { selectedBrands } = this.state;

    if (selectedBrands.includes(value)) {
      return this.setValues(selectedBrands.filter(i => i !== value));
    }

    return this.setValues(selectedBrands.concat(value));
  };

  render() {
    const { getEnvQuery, currentUser } = this.props;
    const config = getEnvQuery.configsGetEnv || {};

    return (
      <QuickNavigation
        showBrands={config.USE_BRAND_RESTRICTIONS === 'true'}
        onChangeBrands={this.onChangeBrands}
        selectedBrands={this.state.selectedBrands}
        logout={this.logout}
        currentUser={currentUser}
      />
    );
  }
}

const WithUser = withCurrentUser(QuickNavigationContainer);

export default withProps(
  compose(
    graphql(gql(generalQueries.configsGetEnv), {
      name: 'getEnvQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(WithUser)
);
