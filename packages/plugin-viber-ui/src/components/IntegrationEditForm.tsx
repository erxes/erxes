import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import query from '../graphql/queries';
import mutations from '../graphql/mutations';

interface IProps {
  integrationId: string;
  isSubmitted: Boolean;
}

const IntegrationEditForm = (props: IProps) => {
  const [newToken, setNewToken] = useState('');

  useEffect(() => {
    if (props.isSubmitted) {
      updateMutation({
        variables: {
          update: {
            inboxId: props.integrationId,
            token: newToken
          }
        }
      });
    }
  }, [props.isSubmitted]);

  const { data, loading } = useQuery(gql(query.viberIntegrationDetail), {
    variables: { integrationId: props.integrationId },
    fetchPolicy: 'network-only'
  });

  const [updateMutation] = useMutation(gql(mutations.viberIntegrationUpdate));

  if (loading) {
    return <></>;
  } else {
    if (!newToken) {
      setNewToken(data.viberIntegrationDetail.token);
    }
  }

  const onChangeToken = (e: any) => {
    setNewToken(e.target.value);
  };

  return (
    <FormGroup>
      <ControlLabel required={false}>Token</ControlLabel>
      <FormControl
        name="token"
        required={false}
        autoFocus={false}
        defaultValue={newToken}
        onChange={onChangeToken}
      />
    </FormGroup>
  );
};

export default IntegrationEditForm;
