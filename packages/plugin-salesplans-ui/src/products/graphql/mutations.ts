const salesLogProductUpdate = `
  mutation salesLogProductUpdate($id: String, $productData: ProductInput) {
    salesLogProductUpdate(_id: $id, productData: $productData)
  }
`;

const salesLogProductRemove = `
  mutation salesLogProductRemove($id: String, $productId: String) {
    salesLogProductRemove(_id: $id, productId: $productId)
  }
`;

export default {
  salesLogProductUpdate,
  salesLogProductRemove
};
