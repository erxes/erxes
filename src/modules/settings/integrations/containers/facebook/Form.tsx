import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import Facebook from 'modules/settings/integrations/components/facebook/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';

import { IPages } from '../../types';

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {} & IRouterProps & Props;

type State = {
  pages: IPages[];
  accountId?: string;
};

class FacebookContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { pages: [] };
  }

  onAccountSelect = (accountId?: string) => {
    if (!accountId) {
      return this.setState({ pages: [], accountId: '' });
    }

    // TODO
    // client
    //   .query({
    //     query: gql(queries.integrationFacebookPageList),
    //     variables: { accountId }
    //   })
    //   .then(({ data, loading }: any) => {
    //     if (!loading) {
    //       this.setState({
    //         pages: data.integrationFacebookPagesList,
    //         accountId
    //       });
    //     }
    //   })
    //   .catch(error => {
    //     Alert.error(error.message);
    //   });
  };

  onRemoveAccount = () => {
    this.setState({ pages: [] });
  };

  onSave = () => {
    const { history } = this.props;
    const { accountId } = this.state;

    if (!accountId) {
      return;
    }

    // TODO
    // saveMutation({ variables: { ...variables, accountId } })
    //   .then(() => {
    //     callback();
    //     Alert.success('You successfully added a integration');
    //     history.push('/settings/integrations');
    //   })
    //   .catch(e => {
    //     Alert.error(e.message);
    //   });
  };

  render() {
    const { closeModal } = this.props;

    const updatedProps = {
      closeModal,
      pages: this.state.pages,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      onSave: this.onSave
    };

    return <Facebook {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.integrationsCreateMessenger), {
      name: 'saveMutation',
      options: () => {
        return {
          refetchQueries: [
            {
              query: gql(queries.integrations)
            },
            {
              query: gql(queries.integrationTotalCount)
            }
          ]
        };
      }
    })
  )(withRouter<FinalProps>(FacebookContainer))
);
