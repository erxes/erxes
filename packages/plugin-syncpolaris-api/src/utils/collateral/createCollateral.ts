import { generateModels } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import {
  customFieldToObject,
  fetchPolaris,
  fetchPolarisWithoutError,
  getBranch,
  getCollateralType,
  sendMessageBrokerData,
  updateContract
} from '../utils';
import { integrateCollateralToLoan } from './integrateCollateralToLoan';
import { openCollateral } from './openCollateral';

export const createCollateral = async (
  subdomain: string,
  polarisConfig,
  data: any
) => {
  const loan = data.contract;
  let collateralObj;

  const models = await generateModels(subdomain);

  const collateral = loan.collateralsData?.[0];
  if (!collateral) return;
  let collateralRes;

  const syncLogDoc = {
    type: '',
    contentType: 'loans:contract',
    contentId: collateral.collateralId,
    createdAt: new Date(),
    createdBy: '',
    consumeData: collateral,
    consumeStr: JSON.stringify(collateral)
  };

  let syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

  const branch = await getBranch(subdomain, loan.branchId);

  const customer = await sendMessageBrokerData(
    subdomain,
    'core',
    'customers.findOne',
    { _id: loan.customerId }
  );

  const customerData = await customFieldToObject(
    subdomain,
    'core:customer',
    customer
  );

  const collateralType = await getCollateralType(
    subdomain,
    collateral.collateralTypeId,
    'loans'
  );

  const product = await sendCoreMessage({
    subdomain,
    action: 'products.findOne',
    data: { _id: collateral.collateralId },
    isRPC: true
  });

  const polarisCollateral = await fetchPolarisWithoutError({
    subdomain,
    op: '13610906',
    data: [product.code],
    polarisConfig
  });

  let sendData = {
    name: product.name,
    name2: product.name,
    custCode: customer.code,
    prodCode: collateralType?.code || '',
    prodType: 'COLL',
    collType: '2',
    brchCode: branch.code,
    addrId: 300001,
    addrDetail: 'Address detail',
    status: 'N',
    maskCode4: 'ГД',
    mask2Code4: 'ГД',
    description: 'collateral.description',
    qty: 4,
    unitPrice: collateral.cost,
    price: collateral.cost,
    curCode: 'MNT',
    priceDate: new Date(),
    prvnReleasePrcnt: 10,
    maskType: 4,
    allowQty: 1,
    maskCode: 'ГД',
    maskCode2: 'ГД',
    marketValueType: '0',
    marketValueDate: new Date(),
    marketValue: collateral.marginAmount,
    registerCode: customerData.registerCode,
    identityType: 'NES'
  };

  if (
    customer?.code &&
    collateral?.cost &&
    customerData?.registerCode != null &&
    polarisCollateral === 'error'
  ) {
    collateralRes = await fetchPolaris({
      subdomain,
      op: '13610900',
      data: [sendData],
      models,
      polarisConfig,
      syncLog
    });

    if (collateralRes.acntCode) {
      await openCollateral(
        subdomain,
        polarisConfig,
        models,
        syncLog,
        collateralRes.acntCode
      );
      await sendCoreMessage({
        subdomain,
        action: 'products.updateProduct',
        data: {
          _id: product._id,
          doc: { ...product, code: collateralRes.acntCode }
        },
        isRPC: true
      });
    }
  }

  if (polarisCollateral !== 'error') {
    collateralObj = JSON.parse(polarisCollateral);
  }

  const integrationCode = collateralRes
    ? collateralRes.acntCode
    : collateralObj.acntCode;

  if (integrationCode) {
    const result = await integrateCollateralToLoan(
      subdomain,
      polarisConfig,
      models,
      syncLog,
      {
        code: integrationCode,
        amount: collateral.marginAmount,
        loanNumber: loan.number
      }
    );

    if (result) {
      await updateContract(
        subdomain,
        { _id: loan._id },
        { $set: { isSyncedCollateral: true } },
        'loans'
      );
    }
  }
};
