import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Users } from './db/models';
import { sendEmail } from './data/utils';

const SECRET = 'dfjklsafjjekjtejifjidfjsfd';

/*
 * Creates regular and refresh tokens using given user information
 * @param {Object} _user - User object
 * @param {String} secret - Token secret
 * @return [String] - list of tokens
 */
const createTokens = async (_user, secret) => {
  const user = { _id: _user._id, email: _user.email, details: _user.details };

  const createToken = await jwt.sign({ user }, secret, { expiresIn: '20m' });

  const createRefreshToken = await jwt.sign({ user }, secret, { expiresIn: '7d' });

  return [createToken, createRefreshToken];
};

/*
 * Renews tokens
 * @param {String} token
 * @param {String} refreshToken
 * @return {Object} renewed tokens with user
 */
export const refreshTokens = async (token, refreshToken) => {
  let _id = null;

  try {
    // validate refresh token
    const { user } = jwt.verify(refreshToken, SECRET);

    _id = user._id;

    // if refresh token is expired then force to login
  } catch (e) {
    return {};
  }

  const user = await Users.findOne({ _id });

  // recreate tokens
  const [newToken, newRefreshToken] = await createTokens(user, SECRET);

  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user,
  };
};

/*
 * Validates user credentials and generates tokens
 * @param {Object} args
 * @param {String} args.email - User email
 * @param {String} args.password - User password
 * @return {Object} - generated tokens
 */
export const login = async ({ email, password }) => {
  const user = await Users.findOne({ email });

  if (!user) {
    // user with provided email not found
    throw new Error('Invalid login');
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    // bad password
    throw new Error('Invalid login');
  }

  // create tokens
  const [token, refreshToken] = await createTokens(user, SECRET);

  return {
    token,
    refreshToken,
  };
};

/*
 * Sends reset password link to found user's email
 * @param {String} email - Registered user's email
 * @return {String} link - Reset password link
 */
export const forgotPassword = async ({ email }) => {
  // find user
  const user = await Users.findOne({ email });

  if (!user) {
    throw new Error('Invalid email');
  }

  // create the random token
  const buffer = await crypto.randomBytes(20);
  const token = buffer.toString('hex');

  // save token & expiration date
  await Users.findByIdAndUpdate(
    { _id: user._id },
    {
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 86400000,
    },
  );

  // send email ==============
  const { COMPANY_EMAIL_FROM, MAIN_APP_DOMAIN } = process.env;

  const link = `${MAIN_APP_DOMAIN}/reset-password?token=${token}`;

  sendEmail({
    toEmails: [email],
    fromEmail: COMPANY_EMAIL_FROM,
    title: 'Reset password',
    template: {
      name: 'base',
      data: {
        content: link,
      },
    },
  });

  return link;
};

/*
 * Resets user password by given token & password
 * @param {String} token - User's temporary token for reset password
 * @param {String} newPassword - New password
 * @return {Promise} - Update user response
 */
export const resetPassword = async ({ token, newPassword }) => {
  // find user by token
  const user = await Users.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw new Error('Password reset token is invalid or has expired.');
  }

  if (!newPassword) {
    throw new Error('Password is required.');
  }

  // set new password
  return Users.findByIdAndUpdate(
    { _id: user._id },
    {
      password: bcrypt.hashSync(newPassword, 10),
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    },
  );
};

/*
 * Finds user object by passed tokens
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export const userMiddleware = async (req, res, next) => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      // verify user token and retrieve stored user information
      const { user } = jwt.verify(token, SECRET);

      // save user in request
      req.user = user;

      // if token is invalid or expired
    } catch (e) {
      const refreshToken = req.headers['x-refresh-token'];

      // create new tokens using refresh token & refresh token
      const newTokens = await refreshTokens(token, refreshToken);

      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);
      }

      // save user in request
      req.user = newTokens.user;
    }
  }

  next();
};

export default {
  login,
  forgotPassword,
  resetPassword,
};
