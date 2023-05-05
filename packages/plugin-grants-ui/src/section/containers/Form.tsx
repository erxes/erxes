import React from 'react';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import Form from '../components/Form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations } from '../graphql';
import { ButtonMutate } from '@erxes/ui/src';

type Props = {
  closeModal: () => void;
};

type FinalProps = {} & Props;

class FormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { closeModal } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      object
    }: IButtonMutateProps) => {
      let mutation = mutations.addGrantRequest;
      let successAction = 'added';
      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={closeModal}
          isSubmitted={isSubmitted}
          //   refetchQueries={refetchQueries(queryParams)}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const updatedProps = {
      renderButton
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps(compose()(FormContainer));
