import {
    customFieldToObject,
    fetchPolaris,
    getBranch,
    getCustomer,
    updateContract,
  } from '../utils';
  import { ICollateral } from './types';
  import { validateCollateralObject } from './validator';
  
  export const createCollateral = async (subdomain: string, params) => {
    const collateral = params.updatedDocument || params.object;
  
    const objectCollateral = await customFieldToObject(
      subdomain,
      'savings:contract',
      collateral,
    );

  
    const branch = await getBranch(subdomain, collateral.branchId);
  
    const customer = await getCustomer(subdomain, collateral.customerId);
  
    let sendData: ICollateral = {
      prodCode: objectCollateral.code,
      brchCode: branch.code,
      curCode: objectCollateral.currency,
      custCode: customer.code,
      name: collateral.number,
      name2: collateral.number,
      prodType: "COLL",
      collType: "2",
      description: objectCollateral.description,
      price: objectCollateral.price,
    };
  
    await validateCollateralObject(sendData);
  
    const collateralCode = await fetchPolaris({
      subdomain,
      op: '13610900',
      data: [sendData],
    });
  
    if (typeof collateralCode === 'string') {
      await updateContract(
        subdomain,
        { _id: collateral._id },
        { $set: { number: JSON.parse(collateralCode) } },
        'savings',
      );
    }
  
    return collateralCode;
  };
  