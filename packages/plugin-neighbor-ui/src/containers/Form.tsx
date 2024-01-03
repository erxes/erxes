import React from 'react';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import Form from '../components/Form';
import { withProps, Alert, __ } from '@erxes/ui/src/utils';

type Props = {
  item?: any;
  type: string;
  refetch: () => void;
  closeModal: () => void;
};

type FinalProps = {} & Props & {
    neighborItemEdit: any;
    neighborItemCreate: any;
  };
class FormContainer extends React.Component<FinalProps> {
  save = doc => {
    const { neighborItemEdit, item, neighborItemCreate } = this.props;

    let mutation = neighborItemCreate,
      variables = doc;

    if (item) {
      mutation = neighborItemEdit;
      variables._id = item._id;
    }

    return mutation({ variables })
      .then(e => {
        Alert.success('Save Successfully');
        this.props.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    return (
      <Form
        item={this.props.item}
        save={this.save}
        closeModal={this.props.closeModal}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any, any>(gql(mutations.neighborItemCreate), {
      name: 'neighborItemCreate'
    }),
    graphql<Props, any, any>(gql(mutations.neighborItemEdit), {
      name: 'neighborItemEdit'
    })
  )(FormContainer)
);
