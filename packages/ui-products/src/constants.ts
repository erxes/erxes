export const TYPES = {
  PRODUCT: "product",
  SERVICE: "service",
  ALL: ["product", "service"],
};

export const PRODUCT_CATEGORY_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Disabled", value: "disabled" },
  { label: "Archived", value: "archived" },
];

export const PRODUCT_SUPPLY = [
  { label: "Unlimited", value: "unlimited" },
  { label: "Limited", value: "limited" },
  { label: "Unique", value: "unique" },
];

export const PRODUCT_INFO = {
  name: "Name",
  type: "Type",
  category: "Category",
  code: "Code",
  description: "Description",
  sku: "Sku",
  unitPrice: "UnitPrice",
  vendor: "Vendor",

  ALL: [
    { field: "name", label: "Name" },
    { field: "type", label: "Type" },
    { field: "category", label: "Category" },
    { field: "code", label: "Code" },
    { field: "description", label: "Description" },
    { field: "sku", label: "Sku" },
    { field: "unitPrice", label: "UnitPrice" },
    { field: "vendor", label: "Vendor" },
  ],
};
