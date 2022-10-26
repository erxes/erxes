const add = `
  mutation {name}sAdd($name: String!, $expiryDate: Date, $typeId:String) {
    {name}sAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation {name}sRemove($_id: String!){
    {name}sRemove(_id: $_id)
  }
  `;

const edit = `
  mutation {name}sEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    {name}sEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    {name}TypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    {name}TypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    {name}TypesEdit(_id: $_id, name: $name){
      _id
    }
  }
`;

export default {
  add,
  remove,
  edit,
  addType,
  removeType,
  editType
};
