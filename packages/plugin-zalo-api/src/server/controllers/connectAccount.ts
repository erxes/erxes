import { getEnv, getSubdomain } from '@erxes/api-utils/src/core';
import { getConfig } from '..';
import { generateModels } from '../../models';
import { IAccount, IAccountModel } from '../../models/Accounts';
import {
  getAccessTokenByOauthCode,
  getAPI,
  setZaloConfigs,
  ZaloAccessToken,
  zaloGet,
  ZaloRefreshToken
} from '../../zalo';
import { debug } from '../../configs';

export const connectAccount = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const ZALO_APP_ID = await getConfig(models, 'ZALO_APP_ID');
  const ZALO_APP_SECRET_KEY = await getConfig(models, 'ZALO_APP_SECRET_KEY');

  const DOMAIN = getEnv({
    name: 'DOMAIN',
    defaultValue: 'http://localhost:4000'
  });
  console.log(DOMAIN);

  // const DOMAIN = "http://localhost:4000";
  console.log('Domain:', getEnv({ name: 'DOMAIN', subdomain }), subdomain);

  const conf = {
    app_id: ZALO_APP_ID,
    secret_key: ZALO_APP_SECRET_KEY,
    redirect_uri: `${DOMAIN}/gateway/pl-zalo/login`
  };

  const authUrl = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${
    conf.app_id
  }&redirect_uri=${encodeURIComponent(conf.redirect_uri)}`;

  if (!req.query.code) {
    return res.redirect(authUrl);
  }

  const config = {
    oa_id: req.query.oa_id,
    code: req.query.code
  };

  setZaloConfigs(conf.app_id, conf.secret_key);
  const token = await getAccessTokenByOauthCode(
    config.code,
    conf.app_id,
    conf.secret_key
  );
  debug.error(`connect ${token}`);
  const OAInfo = await zaloGet('getoa', {
    models,
    oa_id: config.oa_id,
    access_token: token?.access_token
  });

  await createOrUpdateAccount(models.Accounts, {
    oa_id: OAInfo?.data?.oa_id,
    name: OAInfo?.data?.name,
    avatar: OAInfo?.data?.avatar,
    isNewRefreshToken: true,
    access_token: token?.access_token,
    refresh_token: token?.refresh_token
  });

  res.send('<script>window.close();</script > ');
  // res.send({ZaloAccessToken, ZaloRefreshToken, OAInfo})
  // res.send()
};

export const createOrUpdateAccount = async (
  Accounts: IAccountModel,
  accountData: any
) => {
  const {
    oa_id,
    name,
    avatar,
    isNewRefreshToken,
    access_token,
    refresh_token
  } = accountData;

  const access_token_expires_in = new Date().getTime() + 86400000;
  const refresh_token_expires_in = isNewRefreshToken
    ? new Date().getTime() + 719 * 3600000
    : 0;

  const data: IAccount = {
    access_token,
    refresh_token,
    access_token_expires_in
  };

  if (name) data.name = name;
  if (avatar) data.avatar = avatar;
  if (refresh_token_expires_in)
    data.refresh_token_expires_in = refresh_token_expires_in;

  try {
    const account = await Accounts.findOne({
      oa_id
    });

    if (account) {
      return await Accounts.updateOne(
        { _id: account._id },
        {
          $set: data
        }
      );
    }

    await Accounts.create({
      ...data,
      kind: 'zalo',
      oa_id
    });
  } catch (e) {
    debug.error(`Failed to create or update accounts: ${e.message}`);
  }
};
