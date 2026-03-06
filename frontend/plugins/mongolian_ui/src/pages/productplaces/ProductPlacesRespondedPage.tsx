import { useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { PRODUCT_PLACES_RESPONDED } from '~/modules/productplaces/graphql/subscriptions';
import { PerResponse } from '~/modules/productplaces/components/PerResponse';
import { Response } from '~/modules/productplaces/components/Response';

export const ProductPlacesRespondedPage = () => {
  console.log('🔥 ProductPlacesRespondedPage mounted');
  const currentUser = useAtomValue(currentUserState);
  console.log('🔥 currentUser:', currentUser);

  useSubscription(PRODUCT_PLACES_RESPONDED, {
    variables: {
      userId: currentUser?._id,
      sessionCode: '',
    },
    shouldResubscribe: false,
    skip: !currentUser?._id,
    onData: ({ data }) => {
      console.log('🔥 Subscription data received:', data);
      const { productPlacesResponded } = data?.data || {};
      if (!productPlacesResponded) return;

      const { content } = productPlacesResponded;
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
        console.log('🔥 Parsed content:', parsedContent);
      } catch (e) {
        console.error('Failed to parse content', e);
        return;
      }

      if (!parsedContent?.length) return;

      const printContents: string[] = [];
      let counter = 0;

      for (const receipt of parsedContent) {
        printContents.push(PerResponse(receipt, counter));
        counter += 1;
      }

      const printMainContent = Response(printContents.join(''));

      const myWindow = window.open('__', '_blank', 'width=800, height=800') || ({} as Window);

      if ('document' in myWindow && 'write' in myWindow.document) {
        myWindow.document.write(printMainContent);
        myWindow.document.close();
      } else {
        alert('Please allow pop-ups and redirects in site settings!');
      }
    },
    onError: (error) => {
      console.error('🔥 Subscription error:', error);
    },
  });

  return null;
};