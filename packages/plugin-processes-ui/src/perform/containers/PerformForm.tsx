import React from 'react';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';

import { IFlowDocument, IJob } from '../../flow/types';
import { IJobRefer } from '../../job/types';
import Form from '../components/perform/PerformForm';
import { mutations } from '../graphql';
import { IOverallWorkDocument } from '../types';

type Props = {
  closeModal: () => void;
  history: any;
  overallWorkDetail: IOverallWorkDocument;
  max: number;
  jobRefer?: IJobRefer;
};

class ProductFormContainer extends React.Component<Props> {
  render() {
    const { overallWorkDetail, max, jobRefer } = this.props;
    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const { count, performNeedProducts, performResultProducts } = values;

      const doc = {
        startAt: new Date(),
        endAt: new Date(),
        dueDate: new Date(),
        overallWorkId: overallWorkDetail._id,
        status: 'new',
        count: Number(count).toString(),
        needProducts: performNeedProducts,
        resultProducts: performResultProducts
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

    return (
      <Form
        {...updatedProps}
        overallWorkDetail={overallWorkDetail}
        max={max}
        jobRefer={jobRefer}
      />
    );
  }
}

const getRefetchQueries = test => {
  console.log(test);
  return ['performsByOverallWorkId', 'performsByOverallWorkIdTotalCount'];
};

export default ProductFormContainer;
