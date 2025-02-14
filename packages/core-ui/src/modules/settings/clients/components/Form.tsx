import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useEffect, useState } from 'react';
import { __ } from '../../../common/utils';

interface IAction {
  name: string;
  description: string;
}

interface IPermissionModule {
  name: string;
  description: string;
  actions: IAction[];
}

type Props = {
  client?: any;
  modules: IPermissionModule[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const ClientForm = (props: Props) => {
  const { client } = props;

  const [clientObject, setClientObject] = useState<any | undefined>(client);

  const generateDoc = () => {
    const finalValues: any = {};

    if (client) {
      finalValues._id = client._id;
    }

    if (clientObject) {
      finalValues.name = clientObject.name;
    }

    return {
      ...finalValues,
    };
  };

  const onChangeInput = (e) => {
    const { id, value } = e.target;

    const obj: any = clientObject || {};

    obj[id] = value;

    setClientObject(obj);
  };

  const renderModulesSelect = () => {
    const { modules } = props;
  
    const handleActionChange = (
      moduleName: string,
      actionName: string,
      isChecked: boolean
    ) => {
      setClientObject((prev) => {
        const current = prev || { permissions: {} };
        const permissions = current.permissions ? { ...current.permissions } : {};
        const moduleActions = permissions[moduleName] || [];
  
        const newActions = isChecked
          ? [...moduleActions, actionName]
          : moduleActions.filter((action) => action !== actionName);
  
        return {
          ...current,
          permissions: {
            ...permissions,
            [moduleName]: newActions,
          },
        };
      });
    };
  
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
          gap: '20px', // Space between columns
        }}
      >
        {modules.map((module) => (
          <div key={module.name} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
            <h4>{module.name}</h4>
            <p>{module.description}</p>
            {module.actions.map((action) => (
              <FormGroup key={action.name}>
                <ControlLabel>
                  <FormControl
                    componentclass='checkbox'
                    checked={(
                      clientObject?.permissions?.[module.name] || []
                    ).includes(action.name)}
                    onChange={(e: any) => {
                      handleActionChange(
                        module.name,
                        action.name,
                        (e.target as HTMLInputElement).checked
                      );
                    }}
                  />
                  {action.name} - {action.description}
                </ControlLabel>
              </FormGroup>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Application name')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'name'}
            name={'name'}
            required={true}
            defaultValue={clientObject?.name}
            onChange={onChangeInput}
          />
        </FormGroup>

        {renderModulesSelect()}

        <ModalFooter>
          <Button btnStyle='simple' onClick={closeModal} icon='times-circle'>
            Close
          </Button>

          {renderButton({
            name: 'clients',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: client,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ClientForm;
