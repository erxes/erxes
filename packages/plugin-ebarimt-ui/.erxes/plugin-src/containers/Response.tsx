import { IUser } from '@erxes/ui/src/auth/types';
import gql from 'graphql-tag';
import React from 'react';
import { useSubscription } from '@apollo/react-hooks';
import { subscriptions } from '../graphql';
import Response from '../components/Response';

const SUBSCRIPTION = gql(subscriptions.automationSubscription);

type Props = {
  currentUser: IUser;
};

function ReturnResponse({ currentUser }: Props) {
  let content;
  let responseId;


  const { data: response, loading } = useSubscription(SUBSCRIPTION, {
    variables: {
      userId: currentUser._id,
      sessionCode: sessionStorage.getItem('sessioncode') || ''
    },
    shouldResubscribe: false
  });

  if (!response || loading) {
    return <></>;
  }
  content = response.automationResponded.content;

  responseId = response.automationResponded.responseId;

  if (!content || !content._id) {
    return <></>;
  }

  if (
    localStorage.getItem('automationResponseId') &&
    localStorage.getItem('automationResponseId') === responseId
  ) {
    return <></>;
  }

  const printContent = Response(content)
  const myWindow =
    window.open(`__`, '_blank', 'width=800, height=800') || ({} as any);

  localStorage.setItem('automationResponseId', responseId);

  if ('document' in myWindow && 'write' in myWindow.document) {
    myWindow.document.write(printContent);
  } else {
    alert('please allow Pop-ups and redirects on site settings!!!');
  }

  return <></>;
}

export default ReturnResponse;
