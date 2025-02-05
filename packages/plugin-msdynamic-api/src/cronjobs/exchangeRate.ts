import fetch from 'node-fetch';
import { sendCoreMessage } from '../messageBroker';

export const syncExchangeRate = async (subdomain: string, models) => {
  console.log('starting to create exchange rates');

  try {
    const response = await fetch(
      "https://bc.erpmsm.mn:7048/MSM-DATA/ODataV4/Company('MSM Group LLC')/Exchange_Rate_API?$filter=Code eq  'PREPAID'",
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(`MSM\\MSMIT:Tsonh$2h@@`).toString(
            'base64'
          )}`,
        },
        timeout: 180000,
      }
    ).then((res) => res.json());

    const latestByCurrency: { [key: string]: any } = {};

    response.value.forEach((item) => {
      const currency = item.Currency_Code;
      if (
        !latestByCurrency[currency] ||
        new Date(item.Starting_Date) >
          new Date(latestByCurrency[currency].Starting_Date)
      ) {
        latestByCurrency[currency] = item;
      }
    });

    const filteredArray = Object.values(latestByCurrency);

    for (const data of filteredArray || []) {
      const exchangeRate = await sendCoreMessage({
        subdomain,
        action: 'exchangeRates.findOne',
        data: { rateCurrency: data.Currency_Code },
        isRPC: true,
        defaultValue: {},
      });

      const document = {
        date: new Date(data.Starting_Date),
        mainCurrency: 'MNT',
        rateCurrency: data.Currency_Code,
        rate: data.Special_Curr_Exch_Rate,
      };

      if (exchangeRate) {
        await sendCoreMessage({
          subdomain,
          action: 'exchangeRates.update',
          data: {
            selector: {
              rateCurrency: data.Currency_Code,
            },
            modifier: {
              $set: { ...document },
            },
          },
          isRPC: true,
        });
      } else {
        await sendCoreMessage({
          subdomain,
          action: 'exchangeRates.create',
          data: { ...document },
          isRPC: true,
        });
      }
    }

    console.log('ending to create exchange rates');
  } catch (e) {
    console.log(e, 'error');
  }
};
