import client from 'apolloClient';
import gql from 'graphql-tag';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __, Alert, withProps } from 'modules/common/utils';
import Facebook from 'modules/settings/integrations/components/facebook/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';

import { ButtonMutate } from 'modules/common/components';
import { IPages } from '../../types';

type Props = {
  type?: string;
  closeModal: () => void;
};

type CreateFacebookMutationVariables = {
  name: string;
  brandId: string;
  data: {
    pageIds: string[];
  };
};

type CreateFacebookMutationResponse = {
  saveMutation: (
    params: {
      variables: CreateFacebookMutationVariables & {
        accountId: string;
        kind: string;
      };
    }
  ) => Promise<any>;
};

type FinalProps = {} & IRouterProps & Props & CreateFacebookMutationResponse;

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

    client
      .query({
        query: gql(queries.fetchApi),
        variables: {
          path: '/facebook/get-pages',
          params: { accountId }
        }
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            pages: data.integrationsFetchApi,
            accountId
          });
        }
      })
      .catch(error => {
        Alert.error(error.message);
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
    return (
      <ButtonMutate
        mutation={mutations.integrationsCreateExternalIntegration}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="send"
        successMessage={`You successfully added a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  render() {
    const { closeModal } = this.props;

    const updatedProps = {
      closeModal,
      accountId: this.state.accountId,
      pages: this.state.pages,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      renderButton: this.renderButton
    };

    return <Facebook {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    { query: gql(queries.integrations) },
    { query: gql(queries.integrationTotalCount) }
  ];
};

export default withRouter<FinalProps>(FacebookContainer);
