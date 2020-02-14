import gql from 'graphql-tag';
// import { subscriptions } from 'modules/automations/graphql';
import React from 'react';
import { useSubscription } from 'react-apollo';

const SUBSCRIPTION = gql`
  subscription automationResponded {
    automationResponded {
      response
    }
  }
`;

function Erkhet() {
  const { data: pushData } = useSubscription(SUBSCRIPTION);

  console.log('aa', pushData);
  console.log('sdjakdjaklsdjaksljkl');

  return <p>sdadjka</p>;
}

export default Erkhet;
