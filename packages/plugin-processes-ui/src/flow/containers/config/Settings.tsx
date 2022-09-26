import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../../graphql';
import {
  IConfigsMap,
  ProductsConfigsQueryResponse,
  UomsQueryResponse
} from '@erxes/ui-products/src/types';

type Props = {
  component: any;
};
type FinalProps = {
  productsConfigsQuery: ProductsConfigsQueryResponse;
  uomsQuery: UomsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
} & Props;

class SettingsContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, productsConfigsQuery, uomsQuery } = this.props;

    if (productsConfigsQuery.loading || uomsQuery.loading) {
      return <Spinner objective={true} />;
    }

    // create or update action
    const save = (map: IConfigsMap) => {
      updateConfigs({
        variables: { configsMap: map }
      })
        .then(() => {
          productsConfigsQuery.refetch();
          Alert.success('You successfully updated settings');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const configs = productsConfigsQuery.productsConfigs || [];

    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }

    const Component = this.props.component;
    return (
      <Component
        {...this.props}
        configsMap={configsMap}
        save={save}
        uoms={uomsQuery.uoms}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<{}, ProductsConfigsQueryResponse>(gql(queries.productsConfigs), {
      name: 'productsConfigsQuery'
    }),
    graphql<{}, UomsQueryResponse>(gql(queries.uoms), {
      name: 'uomsQuery'
    }),
    graphql<{}>(gql(mutations.productsConfigsUpdate), {
      name: 'updateConfigs'
    })
  )(SettingsContainer)
);
