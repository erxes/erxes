import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert } from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import Button from '@erxes/ui/src/components/Button';
import { FormControl, FormGroup } from '@erxes/ui/src/components/form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import gql from 'graphql-tag';
import React from 'react';
import { queries, mutations } from '../graphql';

type Props = {
  item: any;
  getByTicket: any;
};

type State = {
  loading: boolean;
  assetId?: string;
};

class Container extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { loading: false };
  }

  convert = () => {
    const { assetId } = this.state;

    if (!assetId) {
      return Alert.error('Choose switch');
    }

    this.setState({ loading: true });

    const { item, getByTicket } = this.props;

    client
      .mutate({
        mutation: gql(mutations.contractsCreate),
        variables: { ticketId: item._id, assetId }
      })
      .then(() => {
        getByTicket.refetch();
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  onChangeSwitch = e => {
    this.setState({ assetId: e.currentTarget.value });
  };

  renderForm = () => {
    const { getByTicket } = this.props;
    const data = getByTicket.mobiContractsGetByTicket || {};

    return (
      <div>
        <FormGroup>
          <ControlLabel>Choose switch</ControlLabel>
          <FormControl
            componentClass="select"
            onChange={this.onChangeSwitch}
            options={[
              {},
              ...(data.assets || []).map(asset => {
                return {
                  value: asset._id,
                  label: asset.name
                };
              })
            ]}
          />
        </FormGroup>

        <Button size="small" onClick={this.convert}>
          convert
        </Button>
      </div>
    );
  };

  render() {
    const { item, getByTicket } = this.props;

    if (!item.name.includes('Contract request')) {
      return null;
    }

    const data = getByTicket.mobiContractsGetByTicket || {};

    if (data.contract) {
      return (
        <Button size="small" disabled={true}>
          Converted to contract
        </Button>
      );
    }

    return (
      <ModalTrigger
        title="Convert to contract"
        trigger={<Button size="small">Convert to contract</Button>}
        content={this.renderForm}
      />
    );
  }
}

export default compose(
  graphql(gql(queries.getByTicket), {
    name: 'getByTicket',
    options: ({ item }: any) => ({
      variables: { ticketId: item._id }
    })
  })
)(Container);
