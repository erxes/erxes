import gql from "graphql-tag";
import client from "./apollo-client";
import { IDealInput } from "./types";

const sendEvent = (type: string, doc: IDealInput) => {
  return client.mutate({
    mutation: gql(`
    mutation sendEvent($type: String, $doc: DealProductInput ){
      sendEvent( type: $type, doc: $doc) {
            _id
      }
    }`),
    variables: {
      type,
      doc
    }
  });
};

export { sendEvent };
