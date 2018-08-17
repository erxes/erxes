import gql from "graphql-tag";
import client from "./apollo-client";

interface IDealInput {
  name: string;
  stageId: string;
  companyIds?: string[];
  customerIds?: string[];
  description?: string;
  productsData?: any;
}

const createDeal = (doc: IDealInput) => {
  const {
    name,
    stageId,
    companyIds,
    customerIds,
    description,
    productsData
  } = doc;

  return client.mutate({
    mutation: gql(`
    mutation createDeal(
        $name: String!,
        $stageId: String!, 
        $companyIds: [String], 
        $customerIds: [String], 
        $description: String, 
        $productsData: JSON
    ){
        createDeal(
            name: $name, 
            stageId: $stageId, 
            companyIds: $companyIds, 
            customerIds: $customerIds, 
            description: $description, 
            productsData: $productsData
        ) {
            _id
        }
    }
    `),
    variables: {
      name,
      stageId,
      companyIds,
      customerIds,
      description,
      productsData
    }
  });
};

export { createDeal };
