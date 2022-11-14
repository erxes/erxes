import * as compose from 'lodash.flowright';
import From from '../components/Form';
import gql from 'graphql-tag';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { graphql } from 'react-apollo';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IYearPlan } from '../types';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  yearPlan?: IYearPlan;
  closeModal: () => void;
};

type FinalProps = {} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const {} = this.props;

    const renderButton = ({
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      console.log(values);
      return (
        <ButtonMutate
          mutation={mutations.yearPlansAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['yearPlans'];
};

export default withProps<Props>(compose()(ProductFormContainer));
