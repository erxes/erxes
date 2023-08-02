module.exports = {
  name: "products",
  port: 3022,
  scope: 'products',
  exposes: {
    "./routes": "./src/routes.tsx",
    './extendFormField': './src/containers/productCategory/SelectProductCategory.tsx',
    './extendFormFieldChoice': './src/components/product/FormFieldChoice.tsx',
  },
  routes: {
    url: "http://localhost:3022/remoteEntry.js",
    scope: "products",
    module: "./routes",
  },
  extendFormField: './extendFormField',
  extendFormFieldChoice: './extendFormFieldChoice',
  menus: [
    {
      text: "Product and services",
      to: "/settings/product-service/",
      image: "/images/icons/erxes-31.png",
      location: "settings",
      scope: "products",
      action: "productsAll",
      permissions: ["showProducts", "manageProducts"],
    },
    {
      text: "Configs of Products",
      to: "/settings/uoms-manage/",
      image: "/images/icons/erxes-07.svg",
      location: "settings",
      scope: "products",
      action: "productsAll",
      permissions: ["showProducts", "manageProducts"],
    },
  ],
};
