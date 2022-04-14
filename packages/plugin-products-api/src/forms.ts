
import { PRODUCT_INFO } from "./constants";

export default {
  types: [{ description: 'Products & services', type: 'product' }],
  systemFields: ({ data: { groupId } }) =>
    PRODUCT_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `products:product`,
      canHide: false,
      isDefinedByErxes: true
    }))
};