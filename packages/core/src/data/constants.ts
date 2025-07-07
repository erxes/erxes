export const MODULE_NAMES = {
  CONFIG: "config",
  BRAND: "brand",
  PERMISSION: "permission",
  USER: "user",
  USER_GROUP: "userGroup",
  COMPANY: "company",
  CUSTOMER: "customer",
  PRODUCT: "product",
  PRODUCT_CATEGORY: "productCategory",
  UOM: "uom",
  EMAIl_TEMPLATE: "emailTemplate",
};

export const SEGMENT_STRING_OPERATORS = ["e", "dne", "c", "dnc"];
export const SEGMENT_BOOLEAN_OPERATORS = ["is", "ins", "it", "if"];
export const SEGMENT_NUMBER_OPERATORS = [
  "numbere",
  "numberdne",
  "numberigt",
  "numberilt",
];
export const SEGMENT_DATE_OPERATORS = [
  "dateigt",
  "dateilt",
  "wobm",
  "woam",
  "wobd",
  "woad",
  "drlt",
  "drgt",
  "dateis",
  "dateins",
];

export const DEFAULT_LABELS = {
  phone: [
    { name: "primary", forType: "phone", type: "default" },
    { name: "mobile", forType: "phone", type: "default" },
    { name: "home", forType: "phone", type: "default" },
    { name: "work", forType: "phone", type: "default" },
    { name: "main", forType: "phone", type: "default" },
    { name: "work fax", forType: "phone", type: "default" },
    { name: "home fax", forType: "phone", type: "default" },
    { name: "pager", forType: "phone", type: "default" },
    { name: "other", forType: "phone", type: "default" },
  ],
  email: [
    { name: "primary", forType: "email", type: "default" },
    { name: "personal", forType: "email", type: "default" },
    { name: "work", forType: "email", type: "default" },
    { name: "school", forType: "email", type: "default" },
    { name: "support", forType: "email", type: "default" },
    { name: "billing", forType: "email", type: "default" },
    { name: "other", forType: "email", type: "default" },
  ],
};
