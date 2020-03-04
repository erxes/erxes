import { Companies, Conformities, Customers, ProductCategories, Products, Users } from '../../../db/models';
import { sendNotification } from '../../utils';

const sendError = message => ({
  status: 'error',
  errorMessage: message,
});

const sendSuccess = data => ({
  status: 'success',
  data,
});

const sendNotFound = () => ({
  status: 'notFound',
});

/*
 * Handle requests from integrations api
 */
export const receiveRpcMessage = async msg => {
  try {
    const { action, payload } = msg;
    const doc = JSON.parse(payload || '{}');

    switch (action) {
      case 'get-saved-conformities':
        const conformities = await Conformities.savedConformity({ ...doc });
        return sendSuccess(conformities);

      case 'get-companies':
        const companies = await Companies.find({ ...doc });
        return sendSuccess(companies);

      case 'get-customers':
        const customers = await Customers.find({ ...doc });
        return sendSuccess(customers);

      case 'get-products':
        const products = await Products.find({ ...doc });
        return sendSuccess(products);

      case 'get-or-error-product-category':
        const productCategory = await ProductCategories.findOne({ ...doc });
        if (!productCategory) {
          return sendNotFound();
        }

        return sendSuccess(productCategory);

      case 'get-or-error-product':
        const product = await Products.findOne({ ...doc });
        if (!product) {
          return sendNotFound();
        }
        return sendSuccess(product);

      case 'get-or-error-company':
        const company = await Companies.findOne({ ...doc });
        if (!company) {
          return sendNotFound();
        }

        return sendSuccess(company);

      case 'get-or-error-customer':
        const customer = await Customers.findOne({ ...doc });
        if (!customer) {
          return sendNotFound();
        }

        return sendSuccess(customer);

      case 'get-or-error-user':
        const user = await Users.findOne({ ...doc });
        if (!user) {
          return sendNotFound();
        }

        return sendSuccess(user);

      case 'send-notifications':
        return sendSuccess(await sendNotification({ ...doc }));

      case 'method-from-kind':
        const kind = doc.kind;
        const method = doc.method;
        const params = doc.params;

        switch (kind) {
          case 'Products':
            return sendSuccess(await Products[method](...params));

          case 'ProductCategories':
            return sendSuccess(await ProductCategories[method](...params));

          case 'Customers':
            return sendSuccess(await Customers[method](...params));

          case 'Companies':
            return sendSuccess(await Companies[method](...params));

          case 'Users':
            return sendSuccess(await Users[method](...params));
        }

      default:
        break;
    }
  } catch (e) {
    sendError(e.message);
  }
};
