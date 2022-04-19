import { debug } from "./configs";
import { es } from "./configs";


export const getNumberOfVisits = async (params: {
  url: string;
  visitorId?: string;
  customerId?: string;
}): Promise<number> => {
  const searchId = params.customerId
    ? { customerId: params.customerId }
    : { visitorId: params.visitorId };

  try {
    const response = await es.fetchElk({
      action: "search",
      index: "events",
      body: {
        query: {
          bool: {
            must: [
              { term: { name: "viewPage" } },
              { term: searchId },
              {
                nested: {
                  path: "attributes",
                  query: {
                    bool: {
                      must: [
                        {
                          term: {
                            "attributes.field": "url",
                          },
                        },
                        {
                          match: {
                            "attributes.value": params.url,
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    });

    const hits = response.hits.hits;

    if (hits.length === 0) {
      return 0;
    }

    const [firstHit] = hits;

    return firstHit._source.count;
  } catch (e) {
    debug.error(`Error occured during getNumberOfVisits ${e.message}`);
    return 0;
  }
};