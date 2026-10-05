import { BaseApi } from './base';

import {
  TdbDomesticTransferInput,
  TdbInterbankTransferInput,
  TdbTransferResponse,
} from '../@types/tdb';

export class TransfersApi extends BaseApi {
  /**
   * Domestic TDB -> TDB transfer.
   *
   * POST /v1/transfer/domestic
   *
   * Both debtorAccount and creditorAccount
   * must be IBAN according to CGW documentation.
   */
  async domestic(
    input: TdbDomesticTransferInput,
  ): Promise<TdbTransferResponse> {
    return this.request<TdbTransferResponse>({
      method: 'POST',
      path: 'v1/transfer/domestic',
      data: input,
    });
  }

  /**
   * Interbank transfer.
   *
   * POST /v1/transfer/interbank
   *
   * debtorAccount and creditorAccount must be IBAN.
   */
  async interbank(
    input: TdbInterbankTransferInput,
  ): Promise<TdbTransferResponse> {
    return this.request<TdbTransferResponse>({
      method: 'POST',
      path: 'v1/transfer/interbank',
      data: input,
    });
  }
}