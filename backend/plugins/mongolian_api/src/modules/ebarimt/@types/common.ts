import { IEbarimtConfig } from './configs';

export interface IDoc {
  contentType: string;
  contentId: string;
  number: string;

  date?: Date;
  type: 'B2C_RECEIPT' | 'B2B_RECEIPT';

  customerCode?: string;
  customerName?: string;
  customerTin?: string;
  consumerNo?: string;

  details?: {
    recId: string;
    product: {
      _id: string;
      name: string;
      shortName?: string;
      categoryId?: string;
      type?: string;
      barcodes?: string[];
      unitPrice?: number;
      code: string;
      status?: string;
      uom?: string;

      taxType?: string;
      taxCode?: string;
      citytaxCode?: string;
      citytaxPercent?: number;
    };
    barcode?: string;
    quantity: number;
    unitPrice: number;
    totalDiscount: number;
    totalAmount: number;
  }[];
  nonCashAmounts: { amount: number; type?: string }[];

  inactiveId?: string;
  invoiceId?: string;
}

export interface IPutDataArgs {
  config: IEbarimtConfig;
  doc: IDoc;
}
