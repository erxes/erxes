import * as compose from 'lodash.flowright';
import Form from '../components/EditForm';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IDayLabel } from '../types';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  dayLabel: IDayLabel;
  closeModal: () => void;
};

const EditFormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.dayLabelEdit}
        variables={values}
        callback={callback}
        refetchQueries={['dayLabels', 'dayLabelsCount']}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully updated a day labels`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <Form {...updatedProps} />;
};

export default EditFormContainer;
