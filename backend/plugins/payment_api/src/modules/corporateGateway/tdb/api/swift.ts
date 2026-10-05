import { BaseApi } from './base';

export interface TdbSwiftCustomer {
  customerFullName: string;
  customerFullName2: string;
  registrationNumber: string;
  phoneNumber: string;
  customerAddress: string;
}

export interface TdbSwiftCountry {
  countryShortName: string;
  countryName: string;
  countryName2: string;
  prefix: string;
  countryCode: string;
}

export interface TdbSwiftCurrency {
  currencyName: string;
  currencyId: string;
}

export interface TdbSwiftCharge {
  chargeCode: string;
  chargeName: string;
  chargeName2: string;
  code: string;
}

export interface TdbSwiftFeeInput {
  accountNumber: string;
  beneficiaryCountry: string;
  chargeCode: string;
  amount: number;
  currency: string;
}

export interface TdbSwiftFee {
  feeName: string;
  feeAmount: string;
  feeCurrency: string;
  debitedAmount: string;
}

export interface TdbSwiftMainPurpose {
  categoryCode: string;
  categoryName: string;
  categoryName2: string;
}

export interface TdbSwiftSubPurpose {
  itrsCode: string;
  paymentPurpose: string;
  paymentPurpose2: string;
  categoryCode: string;
}

export interface TdbSwiftFund {
  fundCode: string;
  fundName: string;
  fundName2: string;
}

export interface TdbSwiftTransactionInput {
  confirmed: boolean;

  debtor: {
    accountNumber: string;
    [key: string]: unknown;
  };

  beneficiary: {
    [key: string]: unknown;
  };

  beneficiaryInstitution: {
    [key: string]: unknown;
  };

  intermediaryInstitution?: {
    [key: string]: unknown;
  };

  transaction: {
    amount: number;
    currency: string;
    [key: string]: unknown;
  };

  purpose: {
    [key: string]: unknown;
  };
}

export interface TdbSwiftTransactionResponse {
  requestid: string;
  transactionNumber: string;
  message: string;
}

export interface TdbSwiftAttachFileResponse {
  fileid: string;
  filename: string;
}

export class SwiftApi extends BaseApi {
  /**
   * Get customer information
   *
   * GET /transfer/swift/customer
   */
  async customer() {
    return this.request<TdbSwiftCustomer>({
      method: 'GET',
      path: 'transfer/swift/customer',
    });
  }

  /**
   * Get country list
   *
   * GET /transfer/swift/countries
   */
  async countries() {
    return this.request<TdbSwiftCountry[]>({
      method: 'GET',
      path: 'transfer/swift/countries',
    });
  }

  /**
   * Get currency list
   *
   * GET /transfer/swift/currencies
   */
  async currencies() {
    return this.request<TdbSwiftCurrency[]>({
      method: 'GET',
      path: 'transfer/swift/currencies',
    });
  }

  /**
   * Get SWIFT charge options
   *
   * POST /transfer/swift/charges
   */
  async charges(input: { currency: string; countryCode: string }) {
    return this.request<TdbSwiftCharge[]>({
      method: 'POST',
      path: 'transfer/swift/charges',
      data: input,
    });
  }

  /**
   * Calculate SWIFT transfer fee
   *
   * POST /transfer/swift/fee
   */
  async fee(input: TdbSwiftFeeInput) {
    return this.request<TdbSwiftFee>({
      method: 'POST',
      path: 'transfer/swift/fee',
      data: input,
    });
  }

  /**
   * Get main payment purposes
   *
   * GET /transfer/swift/mainpurpose
   */
  async mainPurpose() {
    return this.request<TdbSwiftMainPurpose[]>({
      method: 'GET',
      path: 'transfer/swift/mainpurpose',
    });
  }

  /**
   * Get sub payment purposes
   *
   * GET /transfer/swift/subpurpose
   */
  async subPurpose(categoryCode?: string) {
    return this.request<TdbSwiftSubPurpose[]>({
      method: 'GET',
      path: 'transfer/swift/subpurpose',
      params: categoryCode ? { categoryCode } : undefined,
    });
  }

  /**
   * Get source of income list
   *
   * GET /transfer/swift/funds
   */
  async funds() {
    return this.request<TdbSwiftFund[]>({
      method: 'GET',
      path: 'transfer/swift/funds',
    });
  }

  /**
   * Create SWIFT transfer
   *
   * POST /transfer/swift/transaction
   */
  async transaction(input: TdbSwiftTransactionInput) {
    return this.request<TdbSwiftTransactionResponse>({
      method: 'POST',
      path: 'transfer/swift/transaction',
      data: input,
    });
  }

  /**
   * Attach document to SWIFT transaction
   *
   * POST /transfer/swift/attachfile
   *
   * NOTE:
   * The documentation says multipart/form-data.
   * BaseApi currently sends JSON, so this method needs
   * special multipart handling.
   */
  async attachFile(transactionNumber: string, file: unknown) {
    // Implement separately once multipart handling
    // is added to BaseApi.
    throw new Error(
      'SWIFT attachFile requires multipart/form-data implementation',
    );
  }
}
