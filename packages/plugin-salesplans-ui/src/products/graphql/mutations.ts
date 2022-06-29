const salesLogProductUpdate = `
  mutation salesLogProductUpdate($id: String, $data: ProductInput) {
    salesLogProductUpdate(_id: $id, data: $data)
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
