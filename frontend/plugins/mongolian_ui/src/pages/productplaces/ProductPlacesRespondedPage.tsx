import { useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { PRODUCT_PLACES_RESPONDED } from '~/modules/productplaces/graphql/subscriptions';
import { PerResponse } from '~/modules/productplaces/components/PerResponse';
import { Response } from '~/modules/productplaces/components/Response';

export const ProductPlacesRespondedPage = () => {
  console.log(' ProductPlacesRespondedPage mounted');
  const currentUser = useAtomValue(currentUserState);

  useSubscription(PRODUCT_PLACES_RESPONDED, {
    variables: {
      userId: currentUser?._id,
      sessionCode: '',
    },
    skip: !currentUser?._id,
    onData: ({ data }) => {
      console.log(' Subscription data received:', data);
      const productPlacesResponded = data.data?.productPlacesResponded;
      if (!productPlacesResponded) return;

      // Parse the JSON string returned by the subscription
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(productPlacesResponded);
      } catch (e) {
        console.error('Failed to parse payload', e);
        return;
      }

      const { content } = parsedPayload;
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse content', e);
        return;
      }

      if (!parsedContent?.length) return;

      const printContents = parsedContent.map((receipt: any, index: number) =>
        PerResponse(receipt, index)
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
      console.error(' Subscription error:', error);
    },
  });

  return null;
}