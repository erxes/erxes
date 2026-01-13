import { gql, useSubscription } from '@apollo/client';
import React from 'react';
import ResponseComponent from '../components/Response';
import PerResponse from '../components/PerResponse';
import { subscriptions } from '../graphql';

// Define types
interface ContentData {
  date: string;
  number?: string;
  branch?: { code?: string; title?: string };
  department?: { code?: string; title?: string };
  customerNo?: string;
  customerName?: string;
  pDatas?: Array<{
    product?: { code?: string; name?: string };
    unitPrice: string | number;
    quantity: string | number;
    amount: string | number;
  }>;
  amount: string | number;
}

interface ProductPlacesResponded {
  responseId: string;
  content: ContentData[];
}

interface SubscriptionResponse {
  productPlacesResponded: ProductPlacesResponded;
}

interface User {
  _id: string;
  // Add other user properties as needed
}

type Props = {
  currentUser: User;
};

// Mock HOC - you'll need to import the real one
const withCurrentUser = (Component: React.ComponentType<Props>) => {
  return (props: Omit<Props, 'currentUser'>) => {
    // In reality, this would get the current user from context/store
    const currentUser = { _id: 'mock-user-id' } as User;
    return <Component {...props} currentUser={currentUser} />;
  };
};

const ReturnResponseBody = ({ currentUser }: Props) => {
  let contents: ContentData[] = [];
  let responseId: string = '';

  const { data: response, loading } = useSubscription<SubscriptionResponse>(
    gql(subscriptions.productPlacesSubscription),
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

  contents = response.productPlacesResponded.content;
  responseId = response.productPlacesResponded.responseId;

  if (!contents || !contents.length) {
    return <></>;
  }

  const printContents: string[] = [];
  let counter = 0;

  for (const content of contents) {
    printContents.push(PerResponse(content, counter));
    counter += 1;
  }

  const printMainContent = ResponseComponent(printContents.join(''));

  const myWindow = window.open('', '_blank', 'width=800, height=800');

  if (myWindow) {
    localStorage.setItem('productPlacesResponseId', responseId);
    
    if (myWindow.document) {
      myWindow.document.write(printMainContent);
    } else {
      alert('please allow Pop-ups and redirects on site settings!!!');
    }
  }

  return <></>;
};

export default withCurrentUser(ReturnResponseBody);