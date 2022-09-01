import * as React from 'react';

import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Gmail from '../../components/gmail/Form';
import client from '@erxes/ui/src/apolloClient';
import { getRefetchQueries } from '../utils';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';

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
        query: gql(queries.integrationsGetGmailEmail),
        variables: {
          accountId
        }
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            email: data.integrationsGetGmailEmail,
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
