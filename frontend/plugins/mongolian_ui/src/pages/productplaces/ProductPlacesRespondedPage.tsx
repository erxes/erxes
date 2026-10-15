import { useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { PRODUCT_PLACES_RESPONDED } from '~/modules/productplaces/graphql/subscriptions';
import { PerResponse } from '~/modules/productplaces/components/PerResponse';
import { Response } from '~/modules/productplaces/components/Response';
import { ProductPlacesReceipt } from '~/modules/productplaces/types';

const SESSION_CODE_STORAGE_KEY = 'sessioncode';

type ProductPlacesResponded = {
  productPlacesResponded?: {
    responseId: string;
    sessionCode: string;
    content?: ProductPlacesReceipt[];
  };
};

export const ProductPlacesRespondedPage = () => {
  const { t } = useTranslation('mongolian');
  const currentUser = useAtomValue(currentUserState);
  const sessionCode = sessionStorage.getItem(SESSION_CODE_STORAGE_KEY) || '';

  useSubscription<ProductPlacesResponded>(PRODUCT_PLACES_RESPONDED, {
    variables: {
      userId: currentUser?._id,
      sessionCode,
    },
    skip: !currentUser?._id || !sessionCode,
    onData: ({ data }) => {
      const productPlacesResponded = data.data?.productPlacesResponded;
      if (!productPlacesResponded) return;

      const parsedContent = productPlacesResponded.content;
      if (
        !parsedContent?.length ||
        productPlacesResponded.sessionCode !==
          sessionStorage.getItem(SESSION_CODE_STORAGE_KEY)
      ) {
        return;
      }

      const printContents = parsedContent.map((receipt, index) =>
        PerResponse(receipt, index),
      );
      const printMainContent = Response(printContents.join(''));

      const myWindow = window.open('__', '_blank', 'width=800, height=800');
      if (myWindow) {
        myWindow.document.write(printMainContent);
        myWindow.document.close();
      } else {
        alert(t('please-allow-popups'));
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    },
  });

  return null;
};
