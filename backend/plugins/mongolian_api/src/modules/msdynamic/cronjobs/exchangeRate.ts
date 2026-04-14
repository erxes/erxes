import fetch from 'node-fetch';
import { getExchangeRates, getPrice } from '../utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

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

  if (!pricePriority) {
    throw new Error('MS Dynamic price priority not configured.');
  }

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
    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { query: productQry },
      defaultValue: [],
    });

    // Build filter section
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
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      },
    ).then((res) => res.json());

    // ✅ Hardened handling of price API response
    const groupedItems: Record<string, any[]> = {};

    if (Array.isArray(response?.value) && response.value.length > 0) {
      for (const item of response.value) {
        const { Item_No } = item;
        if (!groupedItems[Item_No]) {
          groupedItems[Item_No] = [];
        }
        groupedItems[Item_No].push({ ...item });
      }
    }

    const productsByCode: Record<string, any> = {};

    // Map existing products by code
    for (const product of products) {
      if (groupedItems[product.code]) {
        productsByCode[product.code] = product;
      }
    }

    // Update prices
    for (const Item_No in groupedItems) {
      const resProds = groupedItems[Item_No];

      try {
        const { resPrice } = await getPrice(
          resProds,
          pricePriority,
          exchangeRates,
        );

        const foundProduct = productsByCode[Item_No];
        if (foundProduct && foundProduct.unitPrice !== resPrice) {
          await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            module: 'products',
            action: 'updateProduct',
            input: {
              _id: foundProduct._id,
              doc: { unitPrice: resPrice || 0, currency: 'MNT' },
            },
            defaultValue: null,
          });
        }
      } catch (e) {
        console.log(e, 'error while updating price');
      }
    }
  } catch (e) {
    console.log(e, 'error during sync');
  }

  console.log(`${config.title} ending to create exchange rates`);
};
