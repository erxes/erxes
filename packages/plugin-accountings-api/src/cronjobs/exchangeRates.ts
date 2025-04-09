import { sendCoreMessage } from "../messageBroker";

const mntRates = async (
  subdomain: string, NOW: Date, rateCurrencies: string[]
): Promise<void> => {
  const BASE_URL = "https://www.mongolbank.mn/mn/currency-rates/data";

  try {
    const PARAMS = {
      startDate: NOW.toLocaleDateString("en-CA"),
      endDate: NOW.toLocaleDateString("en-CA"),
    };

    const QUERY_STRING = new URLSearchParams(PARAMS).toString();

    const response: any = await fetch(`${BASE_URL}?${QUERY_STRING}`, {
      method: "POST",
    }).then((res) => res.json());

    const { success, data = [] } = response || {};

    if (!success || !data.length) {
      return;
    }

    const exchangeRates: Record<string, string> = data[0] || {};

    for (const [rateCurrency, rate] of Object.entries(exchangeRates)) {
      if (!rateCurrency || !rate) {
        continue;
      }

      if (rateCurrencies.includes(rateCurrency)) {
        await sendCoreMessage({
          subdomain,
          action: "exchangeRates.create",
          data: {
            mainCurrency: 'MNT',
            rateCurrency,
            rate: Number(rate.replace(/,/g, "")),
            date: NOW,
          },
        });
      }
    }
  } catch (error) {
    console.log("error", error.message);
  }
}

export default {
  handleDailyJob: async ({ subdomain }) => {
    const NOW = new Date();
    const MAIN_CURRENCY = "mainCurrency";
    const DEAL_CURRENCY = "dealCurrency";

    const configs = await sendCoreMessage({
      subdomain,
      action: "getConfigs",
      data: {},
      isRPC: true,
      defaultValue: {},
    });

    if (
      !configs[MAIN_CURRENCY] ||
      !configs[DEAL_CURRENCY]?.length
    ) {
      return;
    }

    if (configs[MAIN_CURRENCY] === 'MNT') {
      await mntRates(subdomain, NOW, configs[DEAL_CURRENCY])
    }
  },
};
