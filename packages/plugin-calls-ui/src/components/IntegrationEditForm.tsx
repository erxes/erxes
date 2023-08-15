import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import query from '../graphql/queries';
import mutations from '../graphql/mutations';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

interface IProps {
  integrationId: string;
  isSubmitted: boolean;
}

const Component = ({ integration, isSubmitted, saveDoc }) => {
  const [config, setConfig] = useState<any>(integration);
  const [operatorIds, setOperatorIds] = useState<string[]>(
    integration.operatorIds || []
  );

  useEffect(() => {
    if (isSubmitted) {
      delete config.__typename;
      saveDoc({ ...config, operatorIds });
    }
  }, [isSubmitted]);

  const renderField = ({
    label,
    fieldName,
    value
  }: {
    label: string;
    fieldName: string;
    value: string;
  }) => {
    const onChange = (e: any) => {
      setConfig({ ...config, [fieldName]: e.target.value });
    };

    return (
      <FormGroup>
        <ControlLabel required={true}>{label}</ControlLabel>
        <FormControl
          name={fieldName}
          required={true}
          autoFocus={fieldName === 'name'}
          value={value}
          onChange={onChange}
        />
      </FormGroup>
    );
  };

  return (
    <>
      {renderField({
        label: 'Username',
        fieldName: 'username',
        value: config.username
      })}
      {renderField({
        label: 'Password',
        fieldName: 'password',
        value: config.password
      })}
      {renderField({
        label: 'Phone number',
        fieldName: 'phone',
        value: config.phone
      })}
      {renderField({
        label: 'Web socket server',
        fieldName: 'wsServer',
        value: config.wsServer
      })}

      <FormGroup>
        <ControlLabel>Operators</ControlLabel>
        <SelectTeamMembers
          label="Choose operators"
          name="operatorIds"
          initialValue={config.operatorIds || []}
          onSelect={userIds => {
            setOperatorIds(userIds as string[]);
          }}
        />
      </FormGroup>
    </>
  );
};

const IntegrationEditForm = (props: IProps) => {
  const { data, loading } = useQuery(gql(query.callsIntegrationDetail), {
    variables: { integrationId: props.integrationId },
    fetchPolicy: 'network-only'
  });

  const [updateMutation] = useMutation(gql(mutations.callsIntegrationUpdate));

  if (loading) {
    return null;
  }

  const integration = data.callsIntegrationDetail;

  return (
    <Component
      isSubmitted={props.isSubmitted}
      integration={integration}
      saveDoc={config => {
        updateMutation({
          variables: {
            configs: {
              ...config,
              inboxId: props.integrationId
            }
          }
        });
      }}
    />
  );
};

export default IntegrationEditForm;
