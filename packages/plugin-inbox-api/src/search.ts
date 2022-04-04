import { doSearch } from "@erxes/api-utils/src/core";
import { es } from "./configs";

const search = async ({ data: { value } }) => {
  return [
    {
      module: "conversationMessages",
      items: await doSearch({
        fetchEs: es.fetchElk,
        index: "conversation_messages",
        value,
        fields: ["content"],
      }),
    },
  ];
};

export default search;
