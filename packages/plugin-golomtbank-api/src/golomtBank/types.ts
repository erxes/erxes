

export type GolomtAccount = {
  requestId: string,
  accountId: string,
  accountName: string,
  shortName: string
  currency: string
  branchId: string
  isSocialPayConnected: string
  accountType: {
    schemeCode: string
    schemeType: string
  }

};
