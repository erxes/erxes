import { sendPosMessage } from "./messageBroker";

const handler = async (_root, params: any, { models, messageBroker }) => {
  if (!messageBroker) {
    return;
  }

  await sendPosMessage(models, messageBroker, "pos:crudData", params);
};

const customerActions = { type: "customer", handler };
const userActions = { type: "user", handler };
const productActions = { type: "product", handler };
const productCategoryActions = { type: "productCategory", handler };

export default [
  // customer
  { ...customerActions, action: "create" },
  { ...customerActions, action: "update" },
  { ...customerActions, action: "delete" },
  // user
  { ...userActions, action: "create" },
  { ...userActions, action: "update" },
  { ...userActions, action: "delete" },
  // product
  { ...productActions, action: "create" },
  { ...productActions, action: "update" },
  { ...productActions, action: "delete" },
  // product category
  { ...productCategoryActions, action: "create" },
  { ...productCategoryActions, action: "update" },
  { ...productCategoryActions, action: "delete" },
];
