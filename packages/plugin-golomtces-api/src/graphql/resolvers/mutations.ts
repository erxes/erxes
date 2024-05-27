import { generateExpiredToken, hookMessage } from '../../api';

const golomtcesMutations = {
  async generateExpiredToken(
    _root,
    {
      apiKey,
      userName,
      password,
      tokenKey
    }: { apiKey: string; userName: string; password: string; tokenKey: string }
  ) {
    return generateExpiredToken({
      apiKey,
      userName,
      password,
      tokenKey
    });
  },

  async hookMessage(_root, doc: any) {
    return hookMessage(doc);
  }
};

export default golomtcesMutations;
