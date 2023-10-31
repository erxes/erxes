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

class ConfigForm extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { closeModal, config } = this.props;
    const renderButton = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      object
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
      ...this.props,
      config: config
        ? {
            ...config,
            params: JSON.parse(config?.params || '{}'),
            config: JSON.parse(config?.config || '{}')
          }
        : undefined,
      renderButton
    };

    return <ConfigFormComponent {...updatedProps} />;
  }
}

export default ConfigForm;
