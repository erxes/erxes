import React, { useState, useEffect } from 'react';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  __,
  loadDynamicComponent,
} from '@erxes/ui/src';
import { SelectActions } from '../../common/utils';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import CardsConfig from '../../cards/Configs';

type Props = {
  config?: any;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const ConfigForm: React.FC<Props> = (props) => {
  const [params, setParams] = useState(props?.config?.params || {});
  const [action, setAction] = useState(props?.config?.action || '');
  const [name, setName] = useState(props?.config?.name || '');
  const [config, setConfig] = useState(props?.config?.config || {});
  const [scope, setScope] = useState(props?.config?.scope || '');

  useEffect(() => {
    renderConfig();
  }, [params, action, config, scope]);

  const handleSelect = (value, name, scope?) => {
    if (scope) {
      setScope(scope);
    }
    if (name === 'params') {
      setParams(value);
    }
    if (name === 'config') {
      setConfig(value);
    }
    if (name === 'action') {
      setAction(value);
    }
  };

  const generateDoc = () => {
    const updatedProps: any = {
      name,
      scope,
      action,
      params: JSON.stringify(params),
      config: JSON.stringify(config),
    };

    if (props.config) {
      updatedProps._id = props.config?._id;
    }

    return updatedProps;
  };

  const renderConfig = () => {
    const updatedProps = {
      name,
      scope,
      action,
      params,
      config,
      handleSelect,
    };

    if (scope === 'cards') {
      return <CardsConfig {...updatedProps} />;
    }

    return loadDynamicComponent(
      'grantAction',
      {
        action: action,
        initialProps: updatedProps,
        handleSelect: (params) => handleSelect(params, 'params'),
      },
      false,
      scope,
    );
  };

  const renderForm = (formProps: IFormProps) => {
    const { closeModal, renderButton, config } = props;

    const handleChange = (e, name) => {
      const { value } = e.currentTarget as HTMLInputElement;

      if (name === 'name') {
        setName(value);
      }
      if (name === 'config') {
        setConfig(value);
      }
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
            onChange={(e) => handleChange(e, 'name')}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required>{__('Actions')}</ControlLabel>
          <SelectActions
            label={__("Choose a action")}
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
            object: config,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderForm} />;
};
export default ConfigForm;
