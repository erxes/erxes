const commonParamDefs = `$name: String!, $description: String, $html: String, $css: String, $jsonData: JSON`;
const commonParams = `name: $name, description: $description, html: $html, css: $css, jsonData: $jsonData`;

const add = `
  mutation webbuilderPagesAdd(${commonParamDefs}) {
    webbuilderPagesAdd(${commonParams}) {
      _id
    }
  }
`;

const edit = `
  mutation webbuilderPagesEdit($_id: String!, ${commonParamDefs}) {
    webbuilderPagesEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

export default {
  add,
  edit
};
