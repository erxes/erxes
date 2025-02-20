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

interface IClientPermission {
  module: string;
  actions: string[];
}

interface IClient {
  name: string;
  clientId?: string;

  whiteListedIps: string[];
  permissions: IClientPermission[];
}

type Props = {
  _id?: string;
  client?: IClient;
  modules: IPermissionModule[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  refetch?: () => void;
};

const ClientForm = (props: Props) => {
  console.log('client form', props);
  const { client, _id } = props;

  const [clientObject, setClientObject] = useState<IClient>(
    client || { name: '', permissions: [], whiteListedIps: [] }
  );

  const generateDoc = () => {
    console.log('clientObject', clientObject);
    const finalValues: any = {};

    if (_id) {
      finalValues._id = _id;
    }

    if (clientObject.permissions) {
      finalValues.permissions = clientObject.permissions.map((perm) => {
        return {
          module: perm.module,
          actions: perm.actions,
        };
      });
    }

    if (clientObject.whiteListedIps) {
      finalValues.whiteListedIps = clientObject.whiteListedIps;
    }

    return {
      ...finalValues,
      name: clientObject.name,
    };
  };



  const renderModulesSelect = () => {
    const { modules } = props;

    const handleActionChange = (
      moduleName: string,
      actionName: string,
      isChecked: boolean
    ) => {
      setClientObject((prev) => {
        const permissions = prev.permissions || [];

        const module = permissions.find((perm) => perm.module === moduleName);

        if (!module) {
          return {
            ...prev,
            permissions: [...permissions, { module: moduleName, actions: [] }],
          };
        }

        if (isChecked) {
          return {
            ...prev,
            permissions: permissions.map((perm) => {
              if (perm.module === moduleName) {
                return {
                  ...perm,
                  actions: [...perm.actions, actionName],
                };
              }

              return perm;
            }),
          };
        }

        return {
          ...prev,
          permissions: permissions.map((perm) => {
            if (perm.module === moduleName) {
              return {
                ...perm,
                actions: perm.actions.filter((a) => a !== actionName),
              };
            }

            return perm;
          }),
        };
      });
    };

    const isChecked = (moduleName: string, actionName: string) => {
      const permissions = clientObject.permissions || [];

      const module = permissions.find((perm) => perm.module === moduleName);
      console.log('module', module);

      if (!module) {
        return false;
      }

      return module.actions.includes(actionName);
    };

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        {modules.map((module) => (
          <div
            key={module.name}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            <h4>{module.description}</h4>
            {module.actions
              .filter((a) => a.description !== 'All')
              .map((action) => (
                <FormGroup key={action.name}>
                  <ControlLabel>
                    <FormControl
                      componentclass='checkbox'
                      checked={isChecked(module.name, action.name)}
                      onChange={(e: any) => {
                        handleActionChange(
                          module.name,
                          action.name,
                          (e.target as HTMLInputElement).checked
                        );
                      }}
                    />
                    &nbsp;{action.description}
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
            onChange={(e: any) => {
              setClientObject({ ...clientObject, name: e.target.value });
            }}
          />
        </FormGroup>
        {/* 
        <FormGroup>
          <ControlLabel>{__('White Listed Ips')}</ControlLabel>
          <p>{__('Comma separated list of white listed ips')}</p>
          <FormControl
            {...formProps}
            id={'whiteListedIps'}
            name={'whiteListedIps'}
            defaultValue={clientObject?.whiteListedIps?.join(', ')}
            onChange={onChangeInput}
          />
        </FormGroup> */}

        {renderModulesSelect()}

        <ModalFooter>
          <Button btnStyle='simple' onClick={closeModal} icon='times-circle'>
            Close
          </Button>

          {renderButton({
            name: 'clients',
            values: generateDoc(),
            isSubmitted,
            callback: () => {
              if (props.refetch) {
                props.refetch();
              }

              closeModal();
            },
            object: client,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ClientForm;
