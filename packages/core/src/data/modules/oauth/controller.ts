import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from '../../../connectionResolver';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import client from '../../resolvers/client';
import { IClientDocument } from '../../../db/models/definitions/client';

dotenv.config();

const { JWT_TOKEN_SECRET = '' } = process.env;

export const authorizeClient = async (req: any, res: any) => {
  const { clientId, clientSecret } = req.body;
  const clientIp = req.ip;

  if (!clientId && !clientSecret) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const models = await generateModels(getSubdomain(req));

  const client = await models.Clients.findOne({ clientId });

  if (!client) {
    return res.status(400).json({ error: 'Invalid client id' });
  }

  if (
    client.whiteListedIps.length > 0 &&
    !client.whiteListedIps.includes(clientIp)
  ) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const isValidSecret = await bcrypt.compare(clientSecret, client.clientSecret);

  if (!isValidSecret) {
    return res.status(401).json({ error: 'Invalid client secret' });
  }

  const accessToken = jwt.sign(
    {
      clientId: client.clientId,
      clientSecret: client.clientSecret,
    },
    JWT_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    {
      clientId: client.clientId,
    },
    `${JWT_TOKEN_SECRET}_refresh`,
    { expiresIn: '7d' }
  );

  await models.Clients.updateOne(
    { _id: client._id },
    { $set: { refreshToken } }
  );

  return res
    .status(200)
    .json({ accessToken, refreshToken, type: 'Bearer', expiresIn: 3600 });
};

export const refreshAccessToken = async (req: any, res: any) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Missing refresh token' });
  }

  const models = await generateModels(getSubdomain(req));
  try {
    const decoded: any = jwt.verify(
      refreshToken,
      `${JWT_TOKEN_SECRET}_refresh`
    );
    const client = await models.Clients.findOne({ clientId: decoded.clientId });

    if (!client || client.refreshToken !== refreshToken) {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      {
        clientId: client.clientId,
        clientSecret: client.clientSecret,
      },
      JWT_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      {
        clientId: client.clientId,
      },
      `${JWT_TOKEN_SECRET}_refresh`,
      { expiresIn: '7d' }
    );

    await models.Clients.updateOne(
      { _id: client._id },
      { $set: { refreshToken: newRefreshToken } }
    );

    return res
      .status(200)
      .json({
        accessToken,
        refreshToken: newRefreshToken,
        type: 'Bearer',
        expiresIn: 3600,
      });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid refresh token' });
  }
};
