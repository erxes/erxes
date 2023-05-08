import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import * as compose from 'lodash.flowright';
import Form from '../components/ResponseForm';
import { Alert, ButtonMutate, confirm } from '@erxes/ui/src';
import { refetchQueries } from '../../common/section/utils';
import { mutations } from '../graphql';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

type Props = {
  closeModal: () => void;
  cardId: string;
  cardType: string;
  requestId: string;
};

type FinalProps = {
  responseMutation: any;
} & Props;

export type IResponse = {
  description: string;
  response: 'approved' | 'declined';
};

class ResponseForm extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { closeModal, responseMutation, requestId } = this.props;

    const response = (doc: IResponse) => {
      confirm().then(() => {
        responseMutation({ variables: { ...doc, requestId } })
          .then(() => {
            Alert.success('Successfully sent the response');
            closeModal();
          })
          .catch(e => Alert.error(e.message));
      });
    };

    const updatedProps = {
      closeModal,
      response
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(mutations.responseGrantRequest), {
      name: 'responseMutation',
      options: ({ cardId, cardType }) => ({
        refetchQueries: [
          ...refetchQueries({ cardId, cardType }),
          `${cardType}Detail`
        ]
      })
    })
  )(ResponseForm)
);
