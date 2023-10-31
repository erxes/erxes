import { IModels } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { IContract } from '../definitions/contracts';
import { ITransactionDocument } from '../definitions/transactions';

export async function createEbarimt(
  models: IModels,
  subdomain: string,
  ebarimtConfig: any,
  transaction: ITransactionDocument,
  contract: IContract,
  {
    isGetEBarimt,
    isOrganization,
    organizationRegister
  }: {
    isGetEBarimt?: boolean;
    isOrganization?: boolean;
    organizationRegister?: string;
  }
) {
  let details: any[] = [];

  //check config of ebarimt amount
  if (
    transaction?.payment &&
    transaction.payment > 0 &&
    ebarimtConfig.isAmountUseEBarimt
  ) {
    if (ebarimtConfig.amountEBarimtProduct)
      details.push({
        productId: ebarimtConfig.amountEBarimtProduct._id,
        amount: transaction.payment,
        count: 1,
        discount: 0
      });
    else throw new Error('Amount EBarimt config not found');
  }

  const interest =
    (transaction?.interestEve || 0) + (transaction?.interestNonce || 0);
  //interest config check
  if (interest && interest > 0 && ebarimtConfig.isInterestUseEBarimt) {
    if (ebarimtConfig.interestEBarimtProduct)
      details.push({
        productId: ebarimtConfig.interestEBarimtProduct._id,
        amount: interest,
        count: 1,
        discount: 0
      });
    else throw new Error('Interest EBarimt config not found');
  }

  //undue config check
  if (
    transaction?.undue &&
    transaction.undue > 0 &&
    ebarimtConfig.isUndueUseEBarimt
  ) {
    if (ebarimtConfig.undueEBarimtProduct)
      details.push({
        productId: ebarimtConfig.undueEBarimtProduct._id,
        amount: transaction.undue,
        count: 1,
        discount: 0
      });
    else throw new Error('Undue EBarimt config not found');
  }

  const sumAmount = details.reduce((v, r) => v + r.amount, 0);

  if (sumAmount !== transaction.total)
    throw new Error('Sum value not match transaction total');

  const orderInfo: any = {
    number: transaction.number, // transactionii number l baihad bolno
    date:
      new Date().toISOString().split('T')[0] +
      ' ' +
      new Date().toTimeString().split(' ')[0],
    orderId: transaction._id,
    billType: '1', // ** baiguullaga bol '3'
    description: 'string',
    details: details,
    nonCashAmount: details.reduce((v, m) => v + m.amount, 0)
  };

  if (transaction.isManual && isOrganization && organizationRegister) {
    orderInfo.billType = '3';
    orderInfo.customerCode = organizationRegister;
  } else if (contract.customerType === 'company') {
    const company = await sendMessageBroker(
      {
        subdomain,
        action: 'companies.findOne',
        data: { _id: contract.customerId },
        isRPC: true
      },
      'contacts'
    );
    orderInfo.billType = '3';
    orderInfo.customerCode = company.code;
  }

  if (orderInfo.billType === '3') {
    const companyCheck = await sendMessageBroker(
      {
        subdomain,
        action: 'putresponses.getCompany',
        data: { companyRD: orderInfo.customerCode },
        isRPC: true
      },
      'ebarimt'
    );

    if (companyCheck?.info?.found === false) return;
  }

  const config = {
    districtName: ebarimtConfig?.districtName,
    companyRD: ebarimtConfig?.organizationRegister,
    vatPercent: 10,
    cityTaxPercent: 1,
    hasVat: ebarimtConfig?.isHasVat,
    hasCitytax: false,
    defaultGSCode: ebarimtConfig?.defaultGSCode
  };

  const ebarimt = await sendMessageBroker(
    {
      action: 'putresponses.putDatas',
      data: {
        contentType: 'loans:transaction',
        contentId: transaction._id,
        orderInfo,
        config
      },
      subdomain,
      isRPC: true
    },
    'ebarimt'
  );
  if (ebarimt.length > 0)
    await models.Transactions.updateOne(
      { _id: transaction._id },
      {
        $set: {
          ebarimt: {
            success: ebarimt[0]?.success,
            _id: ebarimt[0]?._id,
            taxType: ebarimt[0]?.taxType,
            vat: ebarimt[0]?.vat
          }
        }
      }
    );
}
