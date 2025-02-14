import fetch from 'node-fetch';
import { sendCoreMessage } from '../messageBroker';
import { getExchangeRates, getPrice } from '../utils';
import { putUpdateLog } from '../logUtils';

export const syncExchangeRate = async (subdomain: string, config: any) => {
  console.log(`${config.title} starting to create exchange rates`);

  let exchangeRates: any = {};

  if (
    !config.priceApi ||
    !config.username ||
    !config.password ||
    !config.brandId
  ) {
    throw new Error('MS Dynamic config not found.');
  }

  const { priceApi, username, password, pricePriority, brandId } = config;

  const productQry: any = { status: { $ne: 'deleted' } };

  if (brandId && brandId !== 'noBrand') {
    productQry.scopeBrandIds = { $in: [brandId] };
  } else {
    productQry.$or = [
      { scopeBrandIds: { $exists: false } },
      { scopeBrandIds: { $size: 0 } },
    ];
  }

  try {
    const products = await sendCoreMessage({
      subdomain,
      action: 'products.find',
      data: {
        query: productQry,
      },
      isRPC: true,
    });

    const salesCodeFilter = pricePriority.replace(/, /g, ',').split(',');

    let filterSection = '';

    for (const price of salesCodeFilter) {
      filterSection += `Sales_Code eq '${price}' or `;
    }

    if (config.exchangeRateApi) {
      exchangeRates = (await getExchangeRates(config)) ?? {};
    }

    const response = await fetch(
      `${priceApi}?$filter=${filterSection} Sales_Code eq ''`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString('base64')}`,
        },
      }
    ).then((res) => res.json());

    const groupedItems = {};

    if (response && response.value.length > 0) {
      for (const item of response.value) {
        const { Item_No } = item;

        if (!groupedItems[Item_No]) {
          groupedItems[Item_No] = [];
        }

        groupedItems[Item_No].push({ ...item });
      }
    }

    const productsByCode = {};
    // delete price
    for (const product of products) {
      if (groupedItems[product.code]) {
        productsByCode[product.code] = product;
      }
    }

    // update price
    for (const Item_No in groupedItems) {
      const resProds = groupedItems[Item_No];
      try {
        const { resPrice } = await getPrice(
          resProds,
          pricePriority,
          exchangeRates
        );

        const foundProduct = productsByCode[Item_No];
        if (foundProduct) {
          if (foundProduct.unitPrice !== resPrice) {
            const updated = await sendCoreMessage({
              subdomain,
              action: 'products.updateProduct',
              data: {
                _id: foundProduct._id,
                doc: { unitPrice: resPrice || 0, currency: 'MNT' },
              },
              isRPC: true,
            });

            await putUpdateLog(subdomain, {
              type: 'product',
              object: foundProduct,
              newData: {
                unitPrice: resPrice || 0,
                currency: 'MNT',
                status: 'active',
              },
              updatedDocument: updated,
            });
          }
        }
      } catch (e) {
        console.log(e, 'error');
      }
    }
  } catch (e) {
    console.log(e, 'error');
  }

  console.log(`${config.title} ending to create exchange rates`);
};
