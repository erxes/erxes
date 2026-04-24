import { useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { PRODUCT_PLACES_RESPONDED } from '~/modules/productplaces/graphql/subscriptions';
import { PerResponse } from '~/modules/productplaces/components/PerResponse';
import { Response } from '~/modules/productplaces/components/Response';

export const ProductPlacesRespondedPage = () => {
  const currentUser = useAtomValue(currentUserState);

  useSubscription(PRODUCT_PLACES_RESPONDED, {
    variables: {
      userId: currentUser?._id,
      sessionCode: '',
    },
    skip: !currentUser?._id,
    onData: ({ data }) => {
      const productPlacesResponded = data.data?.productPlacesResponded;
      if (!productPlacesResponded) return;

      const parsedContent = productPlacesResponded.content;
      if (!parsedContent?.length) return;

      const printContents = parsedContent.map((receipt: any, index: number) =>
        PerResponse(receipt, index),
      );
      const printMainContent = Response(printContents.join(''));

      const myWindow = window.open('__', '_blank', 'width=800, height=800');
      if (myWindow) {
        myWindow.document.write(printMainContent);
        myWindow.document.close();
      } else {
        alert('Please allow pop-ups and redirects in site settings!');
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    },
  });

  return null;
};