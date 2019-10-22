import client from 'apolloClient';
import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { Alert } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { withRouter } from 'react-router';
import Twitter from '../../components/twitter/Twitter';
import { getRefetchQueries } from '../utils';

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {} & IRouterProps & Props;

type State = {
  twitterAccountId: string;
  accountId: string;
};

class TwitterContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { twitterAccountId: '', accountId: '' };
  }

  onAccountSelect = (accountId?: string) => {
    if (!accountId) {
      return this.setState({ twitterAccountId: '', accountId: '' });
    }

    client
      .query({
        query: gql(queries.fetchApi),
        variables: {
          path: '/twitter/get-account',
          params: { accountId }
        }
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            twitterAccountId: data.integrationsFetchApi,
            accountId
          });
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  onRemoveAccount = () => {
    this.setState({ twitterAccountId: '' });
  };

  renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.integrationsCreateExternalIntegration}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries('gmail')}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  render() {
    const { closeModal } = this.props;
    const { accountId, twitterAccountId } = this.state;

    const updatedProps = {
      closeModal,
      accountId,
      twitterAccountId,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      renderButton: this.renderButton
    };

    return <Twitter {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(TwitterContainer);
