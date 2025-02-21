import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Icon from '@erxes/ui/src/components/Icon';
import Info from '@erxes/ui/src/components/Info';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import copy from 'copy-text-to-clipboard';
import React, { useState } from 'react';

import { Alert, __ } from 'modules/common/utils';
import IpInput from '../ui/IpInput';
import { CredentialsRow } from '../styles';

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
  const { client, _id } = props;

  const [clientObject, setClientObject] = useState<IClient>(
    client || { name: '', permissions: [], whiteListedIps: [] }
  );

  const [clientCredentials, setClientCredentials] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);

  const generateDoc = () => {
    const finalValues: any = { ...clientObject };

    if (_id) {
      finalValues._id = _id;
    }

    return {
      ...finalValues,
      permissions: finalValues.permissions.map((perm) => {
        return {
          module: perm.module,
          actions: perm.actions
        };
      })
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

  const renderCredentials = () => {
    if (!clientCredentials) {
      return null;
    }

    return (
      <>
        <h3>
          <Icon icon='key-skeleton-alt' /> Credentials
        </h3>
        <CredentialsRow>
          <p>
            <strong>Client ID:</strong> {clientCredentials.clientId}
          </p>

          <Button
            btnStyle='link'
            size='small'
            icon='copy'
            onClick={() => {
              copy(clientCredentials.clientId);
              Alert.success(__('Client ID has been copied to clipboard'));
            }}
          >
            Copy Client ID
          </Button>
        </CredentialsRow>

        <CredentialsRow>
          <p>
            <strong>Secret:</strong> {clientCredentials.clientSecret}
          </p>

          <Button
            btnStyle='link'
            size='small'
            icon='copy'
            onClick={() => {
              copy(clientCredentials.clientSecret);
              Alert.success(__('Secret has been copied to clipboard'));
            }}
          >
            Copy Secret
          </Button>
        </CredentialsRow>
        <Info type='warning'>
          Save the following credentials in a safe place!
        </Info>
      </>
    );
  };

  const renderForm = (formProps: IFormProps) => {
    if (clientCredentials) {
      return <>{renderCredentials()}</>;
    }

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

        <FormGroup>
          <ControlLabel>{__('White Listed IPs')}</ControlLabel>
          <IpInput
            initialIps={clientObject?.whiteListedIps}
            onChange={(ips: string[]) => {
              setClientObject({ ...clientObject, whiteListedIps: ips });
            }}
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
            callback: (data) => {
              if (data.clientsAdd) {
                const { clientId, clientSecret } = data.clientsAdd;

                setClientCredentials({ clientId, clientSecret });
              }
              if (props.refetch) {
                props.refetch();
              }

              if (props._id) {
                closeModal();
              }
            },
            object: client,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderForm} />;
};

export default ClientForm;
