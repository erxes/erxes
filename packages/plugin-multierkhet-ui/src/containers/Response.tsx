import { gql } from '@apollo/client';
import React from 'react';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import { subscriptions } from '../graphql';
import { useSubscription } from '@apollo/client';

type Props = {
  currentUser: IUser;
};

const ReturnResponseBody = ({ currentUser }: Props) => {
  let contents;
  let responseId;

  const { data: response, loading } = useSubscription(
    gql(subscriptions.multierkhetSubscription),
    {
      variables: {
        userId: currentUser._id,
        sessionCode: sessionStorage.getItem('sessioncode') || ''
      },
      shouldResubscribe: false
    }
  );

  if (!response || loading) {
    return <></>;
  }

  contents = response.multierkhetResponded.content;

  responseId = response.multierkhetResponded.responseId;

  if (!contents || !contents.length) {
    return <></>;
  }

  const printContents: any[] = [];
  let counter = 0;

  for (const content of contents) {
    printContents.push(content.response);
    counter += 1;
  }

  const printMainContent = printContents;

  const myWindow =
    window.open(`__`, '_blank', 'width=800, height=800') || ({} as any);

  localStorage.setItem('multierkhetResponseId', responseId);

  if ('document' in myWindow && 'write' in myWindow.document) {
    myWindow.document.write(printMainContent);
  } else {
    alert('please allow Pop-ups and redirects on site settings!!!');
  }

  return <></>;
};

export default withCurrentUser(ReturnResponseBody);
