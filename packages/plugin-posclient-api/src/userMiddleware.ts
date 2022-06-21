import * as jwt from 'jsonwebtoken';

export const posUserMiddleware = async (req, res) => {
  let token;
  try {
    token = req.cookies['pos-auth-token'];
  } catch (e) {}

  if (token) {
    try {
      // verify user token and retrieve stored user information
      const { user }: any = jwt.verify(
        token,
        process.env.JWT_TOKEN_SECRET || ''
      );

      // save user in request
      req.posUser = user;
      req.posUser.loginToken = token;
    } catch (e) {
      console.log(e.message);
    }
  }
};
