import gql from "graphql-tag";
import client from "./apollo-client";
import { IDealInput } from "./types";

const sendEvent = (type: string, dealDoc: IDealInput) =>
  client.mutate({
    mutation: gql(`
      mutation sendEvent($type: String, $dealDoc: DealInput ){
        sendEvent( type: $type, dealDoc: $dealDoc)
      }`),
    variables: {
      type,
      dealDoc
    }
  });

export { sendEvent };
