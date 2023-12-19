import * as compose from 'lodash.flowright';
import From from '../components/LabelsForm';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ISPLabel } from '../types';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  spLabel?: ISPLabel;
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
      return (
        <ButtonMutate
          mutation={
            object && object._id
              ? mutations.spLabelsEdit
              : mutations.spLabelsAdd
          }
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
  return ['spLabels'];
};

export default withProps<Props>(compose()(ProductFormContainer));
