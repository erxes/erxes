const add = `
  mutation xypAdd($name: String!, $url:String!,$token:String!) {
    xypAdd(name:$name, url: $url, token:$token) {
      name
      _id
      token
      name 
      url
    }
  }
`;

const remove = `
  mutation xypRemove($_id: String!){
    xypRemove(_id: $_id)
  }
  `;

const edit = `
  mutation xypEdit($_id: String!, $name: String!, $url:String!,$token:String!){
    xypEdit(_id: $_id, name: $name, url:$url, token:$token){
      _id
    }
  }
  `;

export default {
  add,
  remove,
  edit
};
