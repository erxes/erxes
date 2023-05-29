import * as compose from 'lodash.flowright';

import { IBrandDoc } from '@erxes/ui/src/brands/types';
import { IChannelDoc } from '../../../channels/types';
import { IntegrationsQueryResponse } from '../../types';
import ManageIntegrations from '../../components/common/ManageIntegrations';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  current: IChannelDoc | IBrandDoc;
  save: (ids: string[]) => Promise<any>;
  closeModal?: () => void;
};

type FinalProps = {
  allIntegrationsQuery: IntegrationsQueryResponse;
} & Props;

type State = {
  perPage: number;
};

class ManageIntegrationsContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { perPage: 20 };
  }

  search = (value, loadmore) => {
    const { allIntegrationsQuery } = this.props;

    if (!loadmore) {
      this.setState({ perPage: 0 });
    }

    this.setState({ perPage: this.state.perPage + 20 }, () => {
      allIntegrationsQuery.refetch({
        searchValue: value,
        perPage: this.state.perPage
      });
    });
  };

  render() {
    const { allIntegrationsQuery, save } = this.props;

    const updatedProps = {
      ...this.props,
      search: this.search,
      save,
      perPage: this.state.perPage,
      allIntegrations: allIntegrationsQuery.integrations || []
    };

    return <ManageIntegrations {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationsQueryResponse, { perPage: number }>(
      gql(queries.integrations),
      {
        name: 'allIntegrationsQuery',
        options: {
          variables: {
            perPage: 20
          },
          fetchPolicy: 'network-only'
        }
      }
    )
  )(ManageIntegrationsContainer)
);
