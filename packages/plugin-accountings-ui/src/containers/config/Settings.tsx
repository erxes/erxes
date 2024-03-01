import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../../graphql';
import { AccountingsConfigsQueryResponse, IConfigsMap } from '../../types';
import { UomsQueryResponse } from '@erxes/ui-products/src/types';

type Props = {
  component: any;
};
type FinalProps = {
  accountingsConfigsQuery: AccountingsConfigsQueryResponse;
  uomsQuery: UomsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
} & Props;

class SettingsContainer extends React.Component<FinalProps> {
  render() {
    const { updateConfigs, accountingsConfigsQuery, uomsQuery } = this.props;

    // create or update action
    const save = (map: IConfigsMap) => {
      updateConfigs({
        variables: { configsMap: map },
      })
        .then(() => {
          accountingsConfigsQuery.refetch();
          Alert.success('You successfully updated settings');
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    };

    const configs = accountingsConfigsQuery.accountingsConfigs || [];

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
        loading={accountingsConfigsQuery.loading || uomsQuery.loading}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<{}, AccountingsConfigsQueryResponse>(
      gql(queries.accountingsConfigs),
      {
        name: 'accountingsConfigsQuery',
      },
    ),
    graphql<{}>(gql(mutations.accountingsConfigsUpdate), {
      name: 'updateConfigs',
    }),
  )(SettingsContainer),
);
