import { gql, useSubscription } from '@apollo/client';
import { useEffect } from 'react';
import ResponseComponent from '../components/Response';
import PerResponse from '../components/PerResponse';
import { subscriptions } from '../graphql';

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
  productPlacesResponded?: ProductPlacesResponded;
}

interface User {
  _id: string;
}

type Props = {
  currentUser: User;
};

// Mock HOC for currentUser
const withCurrentUser = (Component: React.ComponentType<Props>) => {
  return (props: Omit<Props, 'currentUser'>) => {
    const currentUser = { _id: 'mock-user-id' } as User;
    return <Component {...(props as any)} currentUser={currentUser} />;
  };
};

const ReturnResponseBody = ({ currentUser }: Props) => {
  const { data: response, loading } = useSubscription<SubscriptionResponse>(
    gql(subscriptions.productPlacesSubscription),
    {
      variables: {
        userId: currentUser._id,
        sessionCode: sessionStorage.getItem('sessioncode') || '',
      },
      shouldResubscribe: false,
    }
  );

  useEffect(() => {
    const contents = response?.productPlacesResponded?.content;
    const responseId = response?.productPlacesResponded?.responseId;

    if (!contents?.length || !responseId) return;

    const printContents = contents.map((content, index) =>
      PerResponse(content, index),
    );

    const printMainContent = ResponseComponent(printContents.join(''));

    const myWindow = window.open('', '_blank', 'width=800,height=800');
    if (!myWindow) {
      alert('Please allow Pop-ups and redirects in site settings!');
      return;
    }

    localStorage.setItem('productPlacesResponseId', responseId);

    myWindow.document.open();
    myWindow.document.documentElement.innerHTML = printMainContent;
    myWindow.document.close();
  }, [response]);

  return loading ? <div>Loading...</div> : <></>;
};

export default withCurrentUser(ReturnResponseBody);