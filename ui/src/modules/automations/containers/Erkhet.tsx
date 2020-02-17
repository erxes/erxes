import { useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
// import { subscriptions } from 'modules/automations/graphql';
import React from 'react';
const SUBSCRIPTION = gql`
  subscription automationResponded {
    automationResponded {
      content
    }
  }
`;

function Erkhet() {
  const { data: automationResponded } = useSubscription(SUBSCRIPTION, {
    variables: { userId: 'userId' }
  });

  console.log('aa', automationResponded);
  console.log('sdjakdjaklsdjaksljkl');

  return <p>sdadjka</p>;
}

export default Erkhet;
