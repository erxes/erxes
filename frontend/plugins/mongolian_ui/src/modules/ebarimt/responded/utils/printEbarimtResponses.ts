import {
  EbarimtResponse,
  PerResponse,
} from '~/modules/ebarimt/responded/components/PerResponse';
import { Response } from '~/modules/ebarimt/responded/components/Response';

export const printEbarimtResponses = (responses: EbarimtResponse[]) => {
  const printWindow = window.open('__', '_blank', 'width=800, height=800');

  if (!printWindow?.document?.write) {
    return false;
  }

  printWindow.document.write(
    Response(responses.map((response, index) => PerResponse(response, index))),
  );

  return true;
};
