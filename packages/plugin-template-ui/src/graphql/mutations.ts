const categoryParams = `
    $name: String, 
    $parentId: String, 
    $code: String, 
    $contentType: String
`;

const categoryVariables = `
    name: $name, 
    parentId: $parentId, 
    code: $code, 
    contentType: $contentType
`;

const categoryAdd = `
  mutation categoryAdd(${categoryParams}) {
    categoryAdd(${categoryVariables}) {
      _id
    }
  }
`;

const categoryEdit = `
  mutation categoryEdit($_id: String!, ${categoryParams}) {
    categoryEdit(_id: $_id, ${categoryVariables}) {
      _id
    }
  }
`;

const categoryRemove = `
  mutation categoryRemove($_id: String!) {
    categoryRemove(_id: $_id)
  }
`;

export default {
  categoryAdd,
  categoryEdit,
  categoryRemove,
}