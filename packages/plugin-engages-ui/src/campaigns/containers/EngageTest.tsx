import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '@erxes/ui-engage/src/graphql';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

type Props = {
  title: string;
  content: string;
  from: string;
};

const EngageTest = (props: Props) => {
  const [testEmail, setTestEmail] = useState('');
  const { loading, data } = useQuery(gql(queries.verifiedUsers));
  const [sendTestEmailMutation] = useMutation(gql(mutations.sendTestEmail));

  if (loading) {
    return <Spinner objective={true} />;
  }

  const users = data?.users || [];

  return (
    <>
      <FormGroup>
        <ControlLabel>Send to the following email as test:</ControlLabel>

        <FormControl
          placeholder='to@email.com'
          componentclass='select'
          value={testEmail}
          options={[
            { value: '', label: '' },
            ...users.map((user) => ({
              value: user.email,
              label: user.email,
            })),
          ]}
          onChange={(e: any) => setTestEmail(e.target.value)}
        />
        <Button
          disabled={testEmail ? false : true}
          btnStyle='primary'
          icon='send'
          onClick={() => {
            if (!props.content || !props.title || !props.from) {
              return Alert.warning(
                'Please fill title, content and select sender email'
              );
            }

            sendTestEmailMutation({
              variables: {
                to: testEmail,
                from: props.from,
                title: props.title,
                content: props.content,
              },
            })
              .then(() => {
                Alert.success('Email has been sent');
              })
              .catch((e) => {
                Alert.error(e.message);
              });
          }}
        >
          Send
        </Button>
      </FormGroup>
    </>
  );
};

export default EngageTest;
