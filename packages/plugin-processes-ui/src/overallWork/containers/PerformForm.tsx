import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Form from '../components/PerformForm';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';
import { IOverallWorkDet } from '../../overallWork/types';
import { IPerform } from '../types';

type Props = {
  closeModal: () => void;
  history: any;
  overallWorkDetail: IOverallWorkDet;
  perform?: IPerform;
  max?: number;
};

type FinalProps = {} & Props;

class PerformFormContainer extends React.Component<FinalProps> {
  render() {
    const { overallWorkDetail, max } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={values._id ? mutations.performEdit : mutations.performAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
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
      <Form {...updatedProps} overallWorkDetail={overallWorkDetail} max={max} />
    );
  }
}

const getRefetchQueries = () => {
  return ['performs', 'overallWorkDetail', 'performsCount'];
};

export default withProps<Props>(compose()(PerformFormContainer));
