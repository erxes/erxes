import { ButtonMutate } from 'erxes-ui';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import React from 'react';
import PosForm from '../../components/Pos/PosForm';
import { mutations } from '../../graphql';
import { IPos } from '../../types';

type Props = {
  pos?: IPos;
  closeModal: () => void;
};

class CategoryFormContainer extends React.Component<Props> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={
            object
              ? mutations.podEdit
              : mutations.posAdd
          }
          variables={values}
          callback={callback}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${object ? 'updated' : 'added'
            } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <PosForm {...updatedProps} />;
  }
}

export default CategoryFormContainer;
