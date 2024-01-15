import React, { useState } from 'react';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  __,
  loadDynamicComponent
} from '@erxes/ui/src';
import { SelectActions } from '../../common/utils';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import CardsConfig from '../../cards/Configs';

type Props = {
  config?: any;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const ConfigForm: React.FC<Props> = props => {
  const [state, setState] = useState(
    props?.config || {
      name: '',
      action: '',
      params: {},
      config: {}
    }
  );

  const handleSelect = (value, name, scope?) => {
    console.log('state', state);
    const updatedState = {
      ...state,
      [name]: value
    };

    if (scope) {
      console.log('ss', scope);
      updatedState.scope = scope;
    }

    setState(prevState => ({ ...prevState, ...updatedState }));
    console.log('updatedState', updatedState);
  };

  const generateDoc = () => {
    const { name, action, params, config, scope } = state;

    const updatedProps: any = {
      name,
      scope,
      action,
      params: JSON.stringify(params),
      config: JSON.stringify(config)
    };

    if (props.config) {
      updatedProps._id = props.config?._id;
    }

    return updatedProps;
  };

  const renderConfig = () => {
    const { action, scope } = state;

    const updatedProps = {
      ...state,
      config: state.config,
      handleSelect
    };

    if (scope === 'cards') {
      return <CardsConfig {...updatedProps} />;
    }

    return loadDynamicComponent(
      'grantAction',
      {
        action: action,
        initialProps: updatedProps,
        handleSelect: params => handleSelect(params, 'params')
      },
      false,
      scope
    );
  };

  const renderForm = (formProps: IFormProps) => {
    const { closeModal, renderButton, config } = props;
    const { action, name } = state;

    const handleChange = e => {
      const { value } = e.currentTarget as HTMLInputElement;

      setState(prevState => ({ ...prevState, name: value }));
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            value={name}
            required
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required>{__('Actions')}</ControlLabel>
          <SelectActions
            label="Choose a action"
            name="action"
            initialValue={action}
            onSelect={handleSelect}
          />
        </FormGroup>
        {!!action && renderConfig()}
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {renderButton({
            name: 'grant',
            text: 'Grant config',
            isSubmitted: formProps.isSubmitted,
            values: generateDoc(),
            object: config
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderForm} />;
};
export default ConfigForm;
