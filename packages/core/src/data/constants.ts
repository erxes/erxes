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
    { name: "Primary", forType: "phone", type: "default" },
    { name: "Mobile", forType: "phone", type: "default" },
    { name: "Home", forType: "phone", type: "default" },
    { name: "Work", forType: "phone", type: "default" },
    { name: "Main", forType: "phone", type: "default" },
    { name: "Work Fax", forType: "phone", type: "default" },
    { name: "Home Fax", forType: "phone", type: "default" },
    { name: "Pager", forType: "phone", type: "default" },
    { name: "Other", forType: "phone", type: "default" },
  ],
  email: [
    { name: "Primary", forType: "email", type: "default" },
    { name: "Personal", forType: "email", type: "default" },
    { name: "Work", forType: "email", type: "default" },
    { name: "School", forType: "email", type: "default" },
    { name: "Support", forType: "email", type: "default" },
    { name: "Billing", forType: "email", type: "default" },
    { name: "Other", forType: "email", type: "default" },
  ],
};
