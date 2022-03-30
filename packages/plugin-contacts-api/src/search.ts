import { doSearch } from "@erxes/api-utils/src/core";
import { es } from "./configs";

const search = async ({ data: { value } }) => {
  return [
    {
      module: "contacts",
      items: await doSearch({
        fetchEs: es.fetchElk,
        index: "customers",
        value,
        fields: [
          "code",
          "firstName",
          "lastName",
          "middleName",
          "primaryPhone",
          "primaryEmail",
          "searchText",
        ],
      }),
    },
    {
      module: "companies",
      items: await doSearch({
        fetchEs: es.fetchElk,
        index: "companies",
        value,
        fields: [
          "primaryName",
          "industry",
          "plan",
          "primaryEmail",
          "primaryPhone",
          "businessType",
          "description",
          "website",
          "code",
          "searchText",
        ],
      }),
    },
  ];
};

export default search;
