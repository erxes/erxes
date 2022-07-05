import React from 'react';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Form from '../components/perform/PerformForm';
import { mutations } from '../graphql';
import { IProductsData } from '../../types';
import { IOverallWorkDocument } from '../types';

type Props = {
  closeModal: () => void;
  history: any;
  overallWorkDetail: IOverallWorkDocument;
};

class ProductFormContainer extends React.Component<Props> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const { overallWorkDetail } = this.props;
      const doc = {
        startAt: new Date(),
        endAt: new Date(),
        dueDate: new Date(),
        overallWorkId: overallWorkDetail._id,
        status: 'Active',
        count: values.count,
        needProducts: [],
        resultProducts: []
      };

      return (
        <ButtonMutate
          mutation={mutations.performsAdd}
          variables={doc}
          callback={callback}
          refetchQueries={getRefetchQueries('test refetch')}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully added a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = test => {
  console.log(test);
  return ['performsByOverallWorkId', 'performsTotalCount'];
};

export default ProductFormContainer;
