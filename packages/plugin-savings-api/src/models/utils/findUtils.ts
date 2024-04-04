const findCustomerByDesc = async (models, words) => {
  let customer: any = undefined;
  for (const word of words) {
    customer = await models.Customers.findOne({ primaryEmail: word }).lean();
    if (customer && customer._id) {
      break;
    }
  }

  return customer;
};

const findContract = async (models, doc, result) => {
  if (result.contractId) {
    return result;
  }

  if (!doc.description) {
    return result;
  }

  const words = doc.description.split(' ').filter(item => item);

  const customer = await findCustomerByDesc(models, words);

  if (customer && customer._id) {
    const constractIds = await models.Conformities.getSaved({
      mainType: 'customer',
      mainTypeId: customer._id,
      relTypes: ['contract']
    });

    if (constractIds.length) {
      result.contractId = constractIds[0];
      return result;
    }
  }

  return result;
};

export const findContractOfTr = async (models, doc) => {
  let result = {
    contractId: doc.contractId || '',
    invoiceId: doc.invoiceId || '',
    customerId: doc.customerId || '',
    companyId: doc.companyId || ''
  };

  result = await findContract(models, doc, result);

  return result;
};
