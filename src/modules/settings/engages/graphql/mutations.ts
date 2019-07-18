const engagesConfigSave = `
  mutation engagesConfigSave($secretAccessKey: String!, $accessKeyId: String!, $region: String!) {
    engagesConfigSave(secretAccessKey: $secretAccessKey, accessKeyId: $accessKeyId, region: $region) {
      accessKeyId
      secretAccessKey
      region
    }
  }
`;

export default {
  engagesConfigSave
};
