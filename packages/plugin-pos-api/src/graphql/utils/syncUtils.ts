import { Products, ProductCategories } from '../../models/Products';
import { ICustomerDocument } from '../../models/definitions/customers';

export const importUsers = async (isAdmin: boolean = false) => {};

export const preImportProducts = async (groups: any = []) => {
  let importProductIds: string[] = [];
  const importProductCatIds: string[] = [];
  const oldAllProducts = await Products.find({}, { _id: 1 }).lean();
  const oldProductIds = oldAllProducts.map(p => p._id);
  const oldAllProductCats = await ProductCategories.find({}, { _id: 1 }).lean();
  const oldCategoryIds = oldAllProductCats.map(p => p._id);

  for (const group of groups) {
    const categories = group.categories || [];

    for (const category of categories) {
      importProductCatIds.push(category._id);
      importProductIds = importProductIds.concat(
        category.products.map(p => p._id)
      );
    }
  } // end group loop

  const removeProductIds = oldProductIds.filter(
    id => !importProductIds.includes(id)
  );
  await Products.removeProducts(removeProductIds);

  const removeCategoryIds = oldCategoryIds.filter(
    id => !importProductCatIds.includes(id)
  );
  for (const catId of removeCategoryIds) {
    await ProductCategories.removeProductCategory(catId);
  }
};

export const importProducts = async (groups: any = []) => {
  const { REACT_APP_MAIN_API_DOMAIN } = process.env;
  const FILE_PATH = `${REACT_APP_MAIN_API_DOMAIN}/read-file`;
  const attachmentUrlChanger = attachment => {
    return attachment && attachment.url && !attachment.url.includes('http')
      ? { ...attachment, url: `${FILE_PATH}?key=${attachment.url}` }
      : attachment;
  };

  for (const group of groups) {
    const categories = group.categories || [];

    for (const category of categories) {
      await ProductCategories.updateOne(
        { _id: category._id },
        { $set: { ...category, products: undefined } },
        { upsert: true }
      );

      const bulkOps: {
        updateOne: {
          filter: { _id: string };
          update: any;
          upsert: true;
        };
      }[] = [];

      for (const product of category.products) {
        bulkOps.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                ...product,
                sku: product.sku || 'ш',
                attachment: attachmentUrlChanger(product.attachment),
                attachmentMore: (product.attachmentMore || []).map(a =>
                  attachmentUrlChanger(a)
                )
              }
            },
            upsert: true
          }
        });
      }

      if (bulkOps.length) {
        await Products.bulkWrite(bulkOps);
      }
    }
  } // end group loop
};

export const preImportCustomers = async customers => {
  const importCustomerIds = customers.map(c => c._id);
};

export const importCustomers = async (customers: ICustomerDocument[]) => {
  let bulkOps: {
    updateOne: {
      filter: { _id: string };
      update: any;
      upsert: true;
    };
  }[] = [];

  let counter = 0;
  for (const customer of customers) {
    if (counter > 1000) {
      counter = 0;
      bulkOps = [];
    }

    counter += 1;

    bulkOps.push({
      updateOne: {
        filter: { _id: customer._id },
        update: { $set: { ...customer } },
        upsert: true
      }
    });
  }

  if (bulkOps.length) {
  }
};

// Pos config created in main erxes differs from here
export const extractConfig = doc => {
  const { REACT_APP_MAIN_API_DOMAIN } = process.env;
  const {
    uiOptions = {
      favIcon: '',
      logo: '',
      bgImage: '',
      receiptIcon: '',
      kioskHeaderImage: '',
      mobileAppImage: '',
      qrCodeImage: ''
    }
  } = doc;

  const FILE_PATH = `${REACT_APP_MAIN_API_DOMAIN}/read-file`;

  try {
    uiOptions.favIcon =
      uiOptions.favIcon.indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.favIcon}`
        : uiOptions.favIcon;

    uiOptions.logo =
      uiOptions.logo.indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.logo}`
        : uiOptions.logo;

    uiOptions.bgImage =
      uiOptions.bgImage.indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.bgImage}`
        : uiOptions.bgImage;

    uiOptions.receiptIcon =
      uiOptions.receiptIcon.indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.receiptIcon}`
        : uiOptions.receiptIcon;

    uiOptions.kioskHeaderImage =
      uiOptions.kioskHeaderImage.indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.kioskHeaderImage}`
        : uiOptions.kioskHeaderImage;

    uiOptions.mobileAppImage =
      uiOptions.mobileAppImage.indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.mobileAppImage}`
        : uiOptions.mobileAppImage;

    uiOptions.qrCodeImage =
      uiOptions.qrCodeImage.indexOf('http') === -1
        ? `${FILE_PATH}?key=${uiOptions.qrCodeImage}`
        : uiOptions.qrCodeImage;
  } catch (e) {
    console.log(e, '-------');
  }

  return {
    name: doc.name,
    description: doc.description,
    brandId: doc.brandId,
    productDetails: doc.productDetails,
    adminIds: doc.adminIds,
    cashierIds: doc.cashierIds,
    beginNumber: doc.beginNumber,
    maxSkipNumber: doc.maxSkipNumber,
    uiOptions,
    ebarimtConfig: doc.ebarimtConfig,
    kitchenScreen: doc.kitchenScreen,
    waitingScreen: doc.waitingScreen,
    catProdMappings: doc.catProdMappings,
    initialCategoryIds: doc.initialCategoryIds,
    kioskExcludeProductIds: doc.kioskExcludeProductIds
  };
};

export const validateConfig = () => {};

// receive product data through message broker
export const receiveProduct = async data => {
  const { action = '', object = {}, updatedDocument = {} } = data;

  if (action === 'create') {
    return Products.createProduct(object);
  }

  const product = await Products.findOne({ _id: object._id });

  if (action === 'update' && product) {
    return Products.updateProduct(product._id, updatedDocument);
  }

  if (action === 'delete') {
    // check usage
    return Products.removeProducts([object._id]);
  }
};

export const receiveProductCategory = async data => {
  const { action = '', object = {}, updatedDocument = {} } = data;

  if (action === 'create') {
    return ProductCategories.createProductCategory(object);
  }

  const category = await ProductCategories.findOne({ _id: object._id });

  if (action === 'update' && category) {
    return ProductCategories.updateProductCategory(
      category._id,
      updatedDocument
    );
  }

  if (action === 'delete') {
    await ProductCategories.removeProductCategory(category._id);
  }
};

export const receiveCustomer = async data => {
  const { action = '', object = {}, updatedDocument = {} } = data;
};

export const receiveUser = async data => {
  const { action = '', object = {}, updatedDocument = {} } = data;
  const userId =
    updatedDocument && updatedDocument._id ? updatedDocument._id : '';

  // user create logic will be implemented in pos config changes
};

export const receivePosConfig = async data => {
  const {
    updatedDocument = {},
    action = '',
    adminUsers = [],
    cashierUsers = []
  } = data;
};
