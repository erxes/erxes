import { ICoreIModels } from "./connectionResolver";

export const getDocument = async (
  coreModels: ICoreIModels,
  type: "users" | "brands",
  selector: { [key: string]: any }
) => {
  const list = await getDocumentList(coreModels, type, selector);

  if (list.length > 0) {
    return list[0];
  }

  return null;
};

export const getDocumentList = async (
  coreModels: ICoreIModels,
  type: "users" | "brands",
  selector: { [key: string]: any }
) => {
  if (type === "users") {
    return coreModels.Users.find(selector).toArray();
  }

  if (type === "brands") {
    return coreModels.Brands.find(selector).toArray();
  }
};
