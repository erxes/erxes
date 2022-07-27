import * as jwt from 'jsonwebtoken';

export const createJwtToken = payload => {
  const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || '', {
    expiresIn: '14d'
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || '', {
    expiresIn: '30d'
  });

  return { token, refreshToken };
};

export const verifyJwtToken = token => {
  try {
    const { userId }: any = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET || ''
    );
    return userId;
  } catch (err) {
    throw new Error(err.message);
  }
};
