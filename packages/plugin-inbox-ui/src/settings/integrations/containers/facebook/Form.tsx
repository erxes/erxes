import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { Alert } from '@erxes/ui/src/utils';
import Facebook from '../../components/facebook/Form';
import {
  mutations,
  queries
} from '@erxes/ui-settings/src/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { IPages } from '@erxes/ui-inbox/src/settings/integrations/types';
import { getRefetchQueries } from '@erxes/ui-inbox/src/settings/integrations/containers/utils';

type Props = {
  kind: string;
  type?: string;
  callBack: () => void;
};

type FinalProps = {} & IRouterProps & Props;

type State = {
  pages: IPages[];
  accountId?: string;
  loadingPages?: boolean;
};

class FacebookContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { pages: [], loadingPages: false };
  }

  onAccountSelect = (accountId?: string) => {
    if (!accountId) {
      return this.setState({ pages: [], accountId: '' });
    }

    const { kind } = this.props;

    this.setState({ loadingPages: true });

    client
      .query({
        query: gql(queries.integrationsGetFbPages),
        variables: {
          accountId,
          kind
        }
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            pages: data.integrationsGetFbPages,
            accountId,
            loadingPages: false
          });
        }
      })
      .catch(error => {
        Alert.error(error.message);
        this.setState({ loadingPages: false });
      });
  };

  onRemoveAccount = () => {
    this.setState({ pages: [] });
  };

  renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const { kind } = this.props;

    return (
      <ButtonMutate
        mutation={mutations.integrationsCreateExternalIntegration}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(kind)}
        isSubmitted={isSubmitted}
        type='submit'
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  render() {
    const { callBack, kind } = this.props;
    const { accountId, pages, loadingPages } = this.state;

    const updatedProps = {
      kind,
      callBack,
      accountId,
      pages,
      loadingPages,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      renderButton: this.renderButton
    };

    return <Facebook {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(FacebookContainer);
