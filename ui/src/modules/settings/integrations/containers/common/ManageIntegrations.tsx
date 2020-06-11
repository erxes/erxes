import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IBrandDoc } from 'modules/settings/brands/types';
import { IChannelDoc } from 'modules/settings/channels/types';
import ManageIntegrations from 'modules/settings/integrations/components/common/ManageIntegrations';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../../common/utils';
import { IntegrationsQueryResponse } from '../../types';

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
