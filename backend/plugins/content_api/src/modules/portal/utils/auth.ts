import * as jwt from 'jsonwebtoken';
import { IPortal } from '@/portal/@types/portal';
import { IUserDocument } from '@/portal/@types/user';
import { authCookieOptions, getEnv } from 'erxes-api-shared/utils';


export const createJwtToken = (payload: any, clientPortal?: IPortal) => {
  const { tokenExpiration = 1, refreshTokenExpiration = 7 } = clientPortal || {
    tokenExpiration: 1,
    refreshTokenExpiration: 7,
  };

  const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || '', {
    expiresIn: `${tokenExpiration}d`,
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || '', {
    expiresIn: `${refreshTokenExpiration}d`,
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

// The variable "isPassed2FA" is True, when user approved their otp code
export const tokenHandler = async (
  user: IUserDocument,
  clientPortal: IPortal,
  res,
  isEnableTwoFactor = false,
  isPassed2FA = true
) => {
  const cookieOptions: any = {};

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  if (!['test', 'development'].includes(NODE_ENV)) {
    cookieOptions.sameSite = 'none';
  }

  const { tokenPassMethod = 'cookie' } = clientPortal;

  const payload = {
    userId: user._id,
    type: user.type,
    isEnableTwoFactor,
    isPassed2FA,
  };

  const { token, refreshToken } = createJwtToken(payload, clientPortal);

  if (tokenPassMethod === 'header') {
    return { token, refreshToken, ...(isEnableTwoFactor && { isPassed2FA }) };
  }

  const { tokenExpiration } = clientPortal;

  if (tokenExpiration) {
    cookieOptions.expires = tokenExpiration * 24 * 60 * 60 * 1000;
  }

  const options = authCookieOptions(cookieOptions);

  res.cookie('client-auth-token', token, options);

  return { refreshToken, ...(isEnableTwoFactor && { isPassed2FA }) };
};


export const fetchUserFromToki = async (
    token: string,
    clientPortal: IPortal
  ) => {
    if (!clientPortal.tokiConfig) {
      throw new Error('Toki configs are not set');
    }
  
    if (!clientPortal.tokiConfig.apiKey) {
      throw new Error('Toki api key is not set');
    }
  
    const testApiUrl = 'qams-api.toki.mn';
    const prodApiUrl = 'ms-api.toki.mn';
  
    const apiKey = clientPortal.tokiConfig.apiKey;
    const apiUrl = clientPortal.tokiConfig.production ? prodApiUrl : testApiUrl;
  
    try {
      const response = await fetch(`https://${apiUrl}/third-party-service/v1/shoppy/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'api-key': apiKey,
        },
      });
  
      const contentType = response.headers.get('content-type');
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Toki API Error (${response.status}): ${errorText}`
        );
      }
  
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Expected JSON but received: ${text}`);
      }
    } catch (err: any) {
      console.error(err);
      throw new Error(`Failed to fetch user from Toki: ${err.message}`);
    }
  };