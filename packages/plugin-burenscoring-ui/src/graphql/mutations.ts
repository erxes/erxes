const add = `
  mutation burenscoringsAdd($name: String!, $expiryDate: Date, $typeId:String) {
    burenscoringsAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;
export default {
  add
};
