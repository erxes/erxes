import client from 'apolloClient';
import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { IOption } from 'modules/common/types';
import { Alert, getCookie, setCookie, withProps } from 'modules/common/utils';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import { BrandsQueryResponse } from 'modules/settings/brands/types';
import { queries as generalQueries } from 'modules/settings/general/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import QuickNavigation from '../components/QuickNavigation';

type Props = {
  brandsQuery: BrandsQueryResponse;
  getEnvQuery: any;
};

type State = {
  selectedBrands: IOption[];
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

  onChangeBrands = (options: IOption[]) => {
    const { brandsQuery } = this.props;

    let ids = options.map(option => option.value);

    if (ids.length === 0) {
      ids = (brandsQuery.brands || []).map(brand => brand._id);
    }

    setCookie('scopeBrandIds', JSON.stringify(ids));

    this.setState({ selectedBrands: options });

    window.location.reload();
  };

  render() {
    const { brandsQuery, getEnvQuery } = this.props;
    const config = getEnvQuery.configsGetEnv || {};

    return (
      <AppConsumer>
        {({ currentUser }) =>
          currentUser && (
            <QuickNavigation
              showBrands={config.USE_BRAND_RESTRICTIONS === 'true'}
              onChangeBrands={this.onChangeBrands}
              brands={brandsQuery.brands || []}
              selectedBrands={this.state.selectedBrands}
              logout={this.logout}
              currentUser={currentUser}
            />
          )
        }
      </AppConsumer>
    );
  }
}

export default withProps(
  compose(
    graphql(gql(generalQueries.configsGetEnv), {
      name: 'getEnvQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<{}, BrandsQueryResponse>(gql(brandQueries.brands), {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(QuickNavigationContainer)
);
