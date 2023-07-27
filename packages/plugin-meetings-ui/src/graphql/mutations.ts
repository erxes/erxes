const add = `
  mutation meetingssAdd($name: String!, $expiryDate: Date, $typeId:String) {
    meetingssAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation meetingssRemove($_id: String!){
    meetingssRemove(_id: $_id)
  }
  `;

const edit = `
  mutation meetingssEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    meetingssEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    meetingsTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    meetingsTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    meetingsTypesEdit(_id: $_id, name: $name){
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
