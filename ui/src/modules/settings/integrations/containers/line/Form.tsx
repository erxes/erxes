import client from 'apolloClient';
import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { Alert } from 'modules/common/utils';
import Line from 'modules/settings/integrations/components/line/Line';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router';

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
    callback,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.integrationsCreateExternalIntegration}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
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
          id,
        },
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            webhookUrl: data.integrationGetLineWebhookUrl,
          });
        }
      })
      .catch((error) => {
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
      renderButton: this.renderButton,
    };

    return <Line {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(LineContainer);
