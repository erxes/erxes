import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Form from '../components/WorkForm';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';
import { IWorkDocument } from '../types';

type Props = {
  closeModal: () => void;
  history: any;
  work?: IWorkDocument;
};

type FinalProps = {} & Props;

class PerformFormContainer extends React.Component<FinalProps> {
  render() {
    const { work } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={values._id ? mutations.workEdit : mutations.workAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            values._id ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      work,
      renderButton
    };

    return <Form {...updatedProps} work={work} />;
  }
}

const getRefetchQueries = () => {
  return ['works', 'work', 'worksCount'];
};

export default withProps<Props>(compose()(PerformFormContainer));
