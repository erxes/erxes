import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import FormComponent from '../components/Form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations } from '../graphql';
import { ButtonMutate } from '@erxes/ui/src';
import { refetchQueries } from '../common/utils';
type Props = {
  queryParams: any;
  operation: any;
  closeModal: () => void;
};

class Form extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      confirmationUpdate,
      object
    }: IButtonMutateProps) => {
      const afterMutate = () => {
        callback && callback();
      };

      let mutation = mutations.addOperation;
      let successAction = 'added';
      if (object) {
        mutation = mutations.updateOperations;
        successAction = 'updated';
      }
      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={afterMutate}
          isSubmitted={isSubmitted}
          refetchQueries={refetchQueries(this.props.queryParams)}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const updateProps = {
      ...this.props,
      renderButton
    };

    return <FormComponent {...updateProps} />;
  }
}

export default withProps<Props>(compose()(Form));
