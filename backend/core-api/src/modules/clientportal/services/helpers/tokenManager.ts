import * as jwt from 'jsonwebtoken';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IModels } from '~/connectionResolvers';

const JWT_SECRET = process.env.JWT_TOKEN_SECRET || 'SECRET';

/**
 * Verify and refresh access token
 */
export async function refreshAccessToken(
  models: IModels,
  refreshToken: string,
): Promise<{ accessToken: string; user: ICPUserDocument }> {
  try {
    const decoded: any = jwt.verify(refreshToken, JWT_SECRET);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = await models.CPUser.findOne({
      _id: decoded.userId,
      'refreshTokens.token': refreshToken,
    });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is expired
    const tokenData = user.refreshTokens?.find((t) => t.token === refreshToken);

    if (!tokenData || new Date(tokenData.expiresAt) <= new Date()) {
      throw new Error('Refresh token expired');
    }

    // Generate new access token
    const payload = {
      userId: user._id,
      clientPortalId: decoded.clientPortalId,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1d',
    });

    return {
      accessToken,
      user,
    };
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}
