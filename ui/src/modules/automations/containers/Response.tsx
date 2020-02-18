import { useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { subscriptions } from 'modules/automations/graphql';
import React from 'react';

const SUBSCRIPTION = gql(subscriptions.automationSubscription);

type Props = {
  currentUser: IUser;
};

function AutomationRespone({ currentUser }: Props) {
  const { data: automationResponded } = useSubscription(SUBSCRIPTION, {
    variables: { userId: currentUser._id }
  });

  if (!automationResponded) {
    return <></>;
  }

  const content = automationResponded.automationResponded.content;

  const myWindow =
    window.open('', '_blank', 'width=800,height=800') || ({} as any);

  if (myWindow) {
    myWindow.document.write(content);
  }

  window.location.reload();

  return <></>;
}

export default AutomationRespone;
