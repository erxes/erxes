import * as compose from 'lodash.flowright';
import From from '../../components/label/LabelsForm';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ISPLabel } from '../../types';
import { mutations } from '../../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  spLabel?: ISPLabel;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.spLabelsEdit : mutations.spLabelsAdd}
        variables={values}
        callback={callback}
        refetchQueries={['spLabels', 'spLabelsCount']}
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
    ...props,
    renderButton,
  };

  return <From {...updatedProps} />;
};

export default FormContainer;
