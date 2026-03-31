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
      const payload = data?.data?.productPlacesResponded;
      if (!payload) return;

      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (error) {
        console.error('[ProductPlaces] Failed to parse payload', error);
        return;
      }

      const content = parsedPayload?.content;
      if (!content) return;

      let parsedContent: any[];
      try {
        parsedContent = JSON.parse(content);
      } catch (error) {
        console.error('[ProductPlaces] Failed to parse content', error);
        return;
      }

      if (!Array.isArray(parsedContent) || parsedContent.length === 0) return;

      const printContents = parsedContent.map((receipt: any, index: number) =>
        PerResponse(receipt, index),
      );

      const printMainContent = Response(printContents.join(''));

      const printWindow = window.open('', '_blank', 'width=800,height=800');

      if (!printWindow) {
        console.error('[ProductPlaces] Popup blocked');
        alert('Please allow pop-ups and redirects in site settings!');
        return;
      }

      printWindow.document.write(printMainContent);
      printWindow.document.close();
    },

    onError: (error) => {
      console.error('[ProductPlaces] Subscription error:', error);
    },
  });

  return null;
};
