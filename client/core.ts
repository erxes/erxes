import gql from "graphql-tag";
import client from "./apollo-client";
import { IDealInput } from "./types";

const sendEvent = (type: string, doc: IDealInput) => {
  return client.mutate({
    mutation: gql(`
    mutation sendEvent($type: String, $doc: DealInput ){
      sendEvent( type: $type, doc: $doc)
    }`),
    variables: {
      type,
      doc
    }
  });
};

export { sendEvent };
