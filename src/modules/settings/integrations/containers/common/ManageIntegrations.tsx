import gql from 'graphql-tag';
import { IBrandDoc } from 'modules/settings/brands/types';
import { IChannelDoc } from 'modules/settings/channels/types';
import { ManageIntegrations } from 'modules/settings/integrations/components/common';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
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

  render() {
    const { allIntegrationsQuery, save } = this.props;

    const search = (value, loadmore) => {
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

    const clearState = () => {
      allIntegrationsQuery.refetch({ searchValue: '' });
    };

    const updatedProps = {
      ...this.props,
      search,
      save,
      clearState,
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
