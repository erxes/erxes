export function collectOrders(array) {
  return array.map((item, index) => ({
    _id: item._id,
    order: index
  }));
}
