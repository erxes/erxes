import { sendCoreMessage } from "../messageBroker";

export default {
  handleDailyJob: async ({ subdomain }) => {
    const NOW = new Date();
    const MAIN_CURRENCY = "mainCurrency";
    const DEAL_CURRENCY = "dealCurrency";

    const BASE_URL = "https://www.mongolbank.mn/mn/currency-rates/data";

    try {
      const configs = await sendCoreMessage({
        subdomain,
        action: "getConfigs",
        data: {},
        isRPC: true,
        defaultValue: {},
      });

      if (!configs[MAIN_CURRENCY] && !configs[DEAL_CURRENCY]) {
        return;
      }

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

      const rateCurrencies = configs[DEAL_CURRENCY] || [];

      for (const [rateCurrency, rate] of Object.entries(exchangeRates)) {
        if (!rateCurrency || !rate) {
          continue;
        }

        if (rateCurrencies.includes(rateCurrency)) {
          sendCoreMessage({
            subdomain,
            action: "exchangeRates.create",
            data: {
              mainCurrency: configs[MAIN_CURRENCY],
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
  },
};
