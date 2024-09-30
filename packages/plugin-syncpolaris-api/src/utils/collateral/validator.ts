import { ICollateral } from "./types";

const requiredKeys = [
  "name",
  "name2",
  "custCode",
  "prodCode",
  "prodType",
  "collType",
  "brchCode",
  "price",
  "curCode"
];

export const validateCollateralObject = async (value: ICollateral) => {
  for (const key of requiredKeys) {
    if (!value[key]) throw new Error(`${key} value not filled`);
  }
};
