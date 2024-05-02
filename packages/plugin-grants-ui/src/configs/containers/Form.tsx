import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { mutations } from '../graphql';
import { ButtonMutate } from '@erxes/ui/src';
import ConfigFormComponent from '../components/Form';
import { refetchQueries } from './List';

type Props = {
  config: any;
  closeModal: () => void;
};

const ConfigForm: React.FC<Props> = (props) => {
  const { closeModal, config } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    confirmationUpdate,
    object,
  }: IButtonMutateProps) => {
    let mutation = mutations.addConfig;
    let successAction = 'added';

    if (object) {
      mutation = mutations.editConfig;
      successAction = 'edited';
    }

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={closeModal}
        isSubmitted={isSubmitted}
        refetchQueries={refetchQueries()}
        type="submit"
        confirmationUpdate={confirmationUpdate}
        successMessage={`You successfully ${successAction} a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    config: config
      ? {
          ...config,
          params: JSON.parse(config?.params || '{}'),
          config: JSON.parse(config?.config || '{}'),
        }
      : undefined,
    renderButton,
  };

  return <ConfigFormComponent {...updatedProps} />;
};

export default ConfigForm;
