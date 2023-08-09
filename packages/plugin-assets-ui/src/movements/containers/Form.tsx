import { ButtonMutate, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import {
  IMovementDetailQueryResponse,
  IMovementItem
} from '../../common/types';
import { movementRefetchQueries } from '../../common/utils';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
type Props = {
  movementId?: string;
  assetId?: string;
  closeModal: () => void;
  queryParams: any;
};

type FinalProps = {
  movementDetail: IMovementDetailQueryResponse;
} & Props;

class FormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  renderButton = ({
    text,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    let mutation = mutations.movementAdd;
    if (object) {
      mutation = mutations.movementEdit;
    }

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        refetchQueries={movementRefetchQueries(this.props.queryParams)}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully added a ${text}`}
      />
    );
  };
  render() {
    const { movementDetail, closeModal, assetId, movementId } = this.props;

    if (movementDetail && movementDetail.loading) {
      return <Spinner objective />;
    }

    const updatedProps = {
      detail: movementDetail?.assetMovement || {},
      closeModal,
      renderButton: this.renderButton,
      assetId,
      movementId
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.movementDetail), {
      name: 'movementDetail',
      skip: ({ movementId }) => !movementId,
      options: ({ movementId }) => ({
        variables: { _id: movementId },
        fetchPolicy: 'network-only'
      })
    })
  )(FormContainer)
);
