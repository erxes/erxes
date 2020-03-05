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
    variables: { userId: currentUser._id },
    shouldResubscribe: false
  });

  if (!automationResponded) {
    return <></>;
  }

  const content = automationResponded.automationResponded.content;
  const responseId = automationResponded.automationResponded.responseId;

  if (
    localStorage.getItem('automationResponseId') &&
    localStorage.getItem('automationResponseId') === responseId.toString()
  ) {
    return <></>;
  }

  const myWindow =
    window.open('', '_blank', 'width=800,height=800') || ({} as any);

  localStorage.setItem('automationResponseId', responseId);

  if (myWindow && content) {
    myWindow.document.write(content[0]);
  }

  return <></>;
}

export default AutomationRespone;
