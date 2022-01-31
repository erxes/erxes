import client from 'apolloClient';
import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { Alert } from 'modules/common/utils';
import Gmail from 'modules/settings/integrations/components/gmail/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { getRefetchQueries } from '../utils';

type Props = {
  callBack: () => void;
};

type FinalProps = {} & IRouterProps & Props;

type State = {
  email: string;
  accountId: string;
};

class GmailContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { email: '', accountId: '' };
  }

  onAccountSelect = (accountId?: string) => {
    if (!accountId) {
      return this.setState({ email: '', accountId: '' });
    }

    client
      .query({
        query: gql(queries.fetchApi),
        variables: {
          path: '/gmail/get-email',
          params: { accountId }
        }
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            email: data.integrationsFetchApi,
            accountId
          });
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  onRemoveAccount = () => {
    this.setState({ email: '' });
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
    const { callBack } = this.props;
    const { accountId, email } = this.state;

    const updatedProps = {
      callBack,
      accountId,
      email,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      renderButton: this.renderButton
    };

    return <Gmail {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(GmailContainer);
