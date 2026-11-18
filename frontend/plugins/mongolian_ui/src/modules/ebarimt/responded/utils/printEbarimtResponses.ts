import {
  EbarimtResponse,
  PerResponse,
} from '~/modules/ebarimt/responded/components/PerResponse';
import { Response } from '~/modules/ebarimt/responded/components/Response';

const RECEIPT_URL_LIFETIME_MS = 60_000;

export const printEbarimtResponses = (responses: EbarimtResponse[]) => {
  const receiptUrl = URL.createObjectURL(
    new Blob(
      [
        Response(
          responses.map((response, index) => PerResponse(response, index)),
        ),
      ],
      { type: 'text/html' },
    ),
  );
  const printWindow = window.open(
    receiptUrl,
    '_blank',
    'width=800, height=800',
  );

  if (!printWindow) {
    URL.revokeObjectURL(receiptUrl);
    return false;
  }

  setTimeout(() => URL.revokeObjectURL(receiptUrl), RECEIPT_URL_LIFETIME_MS);

  return true;
};
