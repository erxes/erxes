import * as validator from 'validator';

const findCustomerByDesc = async (models, words) => {
  let customer: any = undefined;
  for (const word of words) {
    if (!validator.isEmail(word)) continue;

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

  if (result.invoiceId) {
    const invoice = await models.LoanInvoices.findOne({
      _id: result.invoiceId
    }).lean();
    result.contractId = invoice.contractId;
    return result;
  }

  if (!doc.description) {
    return result;
  }

  const words = doc.description.split(' ').filter(item => item);
  for (const word of words) {
    const invoice = await models.LoanInvoices.findOne({ number: word }).lean();
    if (invoice && invoice.contractId) {
      result.contractId = invoice.contractId;
      result.invoiceId = invoice._id;
      return result;
    }
  }

  for (const word of words) {
    const contract = await models.LoanContracts.findOne({
      number: word
    }).lean();
    if (contract && contract._id) {
      result.contractId = contract._id;
      return result;
    }
  }

  const customer = await findCustomerByDesc(models, words);

  console.log('++++++++++++++++++++++++++++++++++++ ', customer);

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
