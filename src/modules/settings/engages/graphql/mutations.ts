const engagesConfigSave = `
  mutation engagesConfigSave($secretAccessKey: String!, $accessKeyId: String!) {
    engagesConfigSave(secretAccessKey: $secretAccessKey, accessKeyId: $accessKeyId)
  }
`;

export default {
  engagesConfigSave
};
