import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import { Alert } from '@erxes/ui/src/utils';
import Line from '../../components/line/Line';
import {
  mutations,
  queries
} from '@erxes/ui-settings/src/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router-dom';

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {} & IRouterProps & Props;

type State = {
  webhookUrl: string;
};

class LineContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { webhookUrl: '' };
  }

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
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={__(`You successfully added a`) + `${name}`}
      />
    );
  };

  onSave = (integration?) => {
    if (!integration) {
      return this.setState({ webhookUrl: '' });
    }

    const id = integration.integrationsCreateExternalIntegration._id;

    client
      .query({
        query: gql(queries.integrationGetLineWebhookUrl),
        variables: {
          id
        }
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            webhookUrl: data.integrationGetLineWebhookUrl
          });
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { closeModal } = this.props;
    const { webhookUrl } = this.state;
    const updatedProps = {
      closeModal,
      webhookUrl,
      onSave: this.onSave,
      renderButton: this.renderButton
    };

    return <Line {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(LineContainer);
