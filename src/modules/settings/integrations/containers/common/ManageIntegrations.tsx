import gql from 'graphql-tag';
import { ManageIntegrations } from 'modules/settings/integrations/components/common';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  current: any;
  allIntegrationsQuery: any;
  save: (ids: string[]) => Promise<any>;
  closeModal: () => void;
};

type State = {
  perPage: number;
};

class ManageIntegrationsContainer extends React.Component<Props, State> {
  constructor(props: Props) {
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
          perPage: this.state.perPage,
          searchValue: value
        });
      });
    };

    const clearState = () => {
      allIntegrationsQuery.refetch({ searchValue: '' });
    };

    const updatedProps = {
      ...this.props,
      allIntegrations: allIntegrationsQuery.integrations || [],
      clearState,
      perPage: this.state.perPage,
      save,
      search
    };

    return <ManageIntegrations {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.integrations), {
    name: 'allIntegrationsQuery',
    options: {
      variables: {
        perPage: 20
      }
    }
  })
)(ManageIntegrationsContainer);
