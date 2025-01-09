const tempalteParams = `
    $name: String,
    $description: String,
    $content: String,
    $contentType: String,
    $categoryIds: [String]
`;

const templateVariables = `
    name: $name,
    description: $description,
    content: $content,
    contentType: $contentType,
    categoryIds: $categoryIds
`;

const templateAdd = `
    mutation templateAdd(${tempalteParams}) {
        templateAdd(${templateVariables}) {
            _id
        }
    }
`;

const templateEdit = `
    mutation templateEdit($_id: String!, ${tempalteParams}) {
        templateEdit(_id: $_id, ${templateVariables}) {
            _id
        }
    }
`;

const templateRemove = `
    mutation templateRemove($_id: String!) {
        templateRemove(_id: $_id)
    }
`;

const templateUse = `
  mutation templateUse($_id: String!) {
    templateUse(_id: $_id)
  }
`;

export default {
    templateAdd,
    templateEdit,
    templateRemove,

    templateUse
}