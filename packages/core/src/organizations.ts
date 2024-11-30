import * as url from "url";
import * as dns from "dns";

import { IModels } from "./connectionResolver";
import { getConfig, getEnv, getFileUploadConfigs } from "./data/utils";

import redis from "@erxes/api-utils/src/redis";
import fetch from "node-fetch";
import {
  coreModelEndpoints,
  coreModelOrganizations,
  coreModelPromoCodes,
  coreModelUsers,
  getCoreConnection,
  getOrganizationDetail
} from "@erxes/api-utils/src/saas/saas";

import { deleteNginx } from "./ingress";
import { PROMOCODE_STATUS } from "@erxes/api-utils/src/saas/definition";
import { authCookieOptions } from "@erxes/api-utils/src/core";
import { PROMO_CODE_TYPE } from "@erxes/api-utils/src/saas/constants";

export let MAPPING: { [key: string]: IModels } = {};

interface IUpdateOrganizationInfoParams {
  subdomain: string;
  name: string;
  favicon: string;
  domain: string;
  link: string;
  icon?: string;
  logo?: string;
  iconColor?: string;
  textColor?: string;
  backgroundColor?: string;
  description?: string;
}

interface IUpdateOrganizationDomainParams {
  subdomain: string;
  type: string;
  domain: string;
}

export const useCloudflareAPI = async ({
  organization,
  type,
  customDomain,
  customHostNameId
}: {
  organization: any;
  type: string;
  customDomain: any;
  customHostNameId?: string;
}) => {
  const CLOUDFLARE_ZONE_ID = await getConfig("CLOUDFLARE_ZONE_ID", "");

  const CLOUDFLARE_CUSTOMHOST_API_TOKEN = await getConfig(
    "CLOUDFLARE_CUSTOMHOST_API_TOKEN",
    ""
  );

  const customDomainStatus = organization.customDomainStatus || {};

  const hostId = customHostNameId || customDomainStatus.id;

  let url = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostId}`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${CLOUDFLARE_CUSTOMHOST_API_TOKEN}`
  };

  let requestOptions = {
    method: "DELETE",
    headers,
    body: JSON.stringify({ hostname: customDomain.hostname })
  } as any;

  if (type === "get") {
    requestOptions = {
      method: "GET",
      headers
    };
  }

  if (type === "create") {
    url = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`;

    requestOptions = {
      method: "POST",
      headers,
      body: JSON.stringify({
        hostname: customDomain.hostname,
        ssl: {
          method: "txt",
          type: "dv",
          settings: { min_tls_version: "1.0" }
        }
      })
    };
  }

  const result = await fetch(url, requestOptions)
    .then(response => response.json())
    .then(async data => {
      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0].message);
      }

      return data?.result || {};
    })
    .catch(error => {
      throw new Error(error.message);
    });

  return result;
};

export const checkCNAME = (subdomain: string, hostname?: string) => {
  if (!hostname) {
    return;
  }

  return new Promise((resolve, reject) => {
    return dns.resolveCname(hostname, (error, address) => {
      if (error) {
        return reject("custom hostname does not CNAME to this organization");
      }

      return resolve(address.includes(subdomain));
    });
  });
};

export const updateOrganizationDomain = async ({
  type,
  subdomain,
  domain
}: IUpdateOrganizationDomainParams) => {
  const organization = await coreModelOrganizations.findOne({ subdomain });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const customDomain = url.parse(domain);

  const doc: { [key: string]: string | null | undefined | object } = {};

  try {
    if (type === "reset") {
      doc.dnsStatus = null;
      doc.customDomainStatus = {};
      doc.domain = null;

      await useCloudflareAPI({
        organization,
        type: "delete",
        customDomain
      });

      if (organization.dnsStatus === "active") {
        await deleteNginx(subdomain);
      }
    } else if (type === "refresh") {
      const cnameResolved = await checkCNAME(
        subdomain + ".app.erxes.io",
        customDomain.hostname || ""
      );

      if (!cnameResolved) {
        doc.dnsStatus = "pending";
      }

      const result = await useCloudflareAPI({
        organization,
        type: "get",
        customDomain
      });

      if (result.status === "active") {
        doc.hostNameStatus = "active";
      }

      if (result?.ssl?.status === "active") {
        doc.sslStatus = "active";
      }
    } else if (domain || organization.domain !== customDomain) {
      const resultCreate = await useCloudflareAPI({
        organization,
        type: "create",
        customDomain
      });

      const resultGet = await useCloudflareAPI({
        organization,
        type: "get",
        customDomain,
        customHostNameId: resultCreate.id
      });
      doc.dnsStatus = "pending";
      doc.hostNameStatus = "pending";
      doc.sslStatus = "pending";
      doc.domain = domain;
      doc.customDomainStatus = resultGet;
    }
  } catch (e) {
    throw new Error(e);
  }

  await coreModelOrganizations.updateOne(
    { _id: organization._id },
    { $set: doc }
  );

  await redis.set("core_organizations", "");

  return coreModelOrganizations.findOne({ _id: organization._id });
};

export const updateOrganizationInfo = async (
  {
    subdomain,
    link,
    name,
    icon,
    iconColor,
    textColor,
    logo,
    backgroundColor,
    description,
    favicon
  }: IUpdateOrganizationInfoParams,
  res,
  cookies
) => {
  if (!name || !subdomain || name === "" || subdomain === "") {
    throw new Error("Name or subdomain can not be empty");
  }

  const organization = await coreModelOrganizations.findOne({ subdomain });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const domain = link
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "") // Remove all spaces
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "") // Replace multiple - with ''
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "");

  const duplicatedOrg = await coreModelOrganizations.findOne({
    subdomain: domain,
    _id: { $ne: organization._id }
  });

  if (duplicatedOrg) {
    throw new Error("Your chosen link is already taken");
  }

  const doc: { [key: string]: string | null | undefined } = {
    name,
    icon,
    iconColor,
    subdomain: domain,
    logo,
    backgroundColor,
    textColor,
    favicon,
    description
  };

  await coreModelOrganizations.updateOne(
    { _id: organization._id },
    { $set: doc }
  );

  if (organization.subdomain !== link) {
    res.clearCookie("auth-token");

    // Remove organization from organizations cookie
    const coreHost = url.parse(getEnv({ name: "CORE_DOMAIN" }) || "").hostname;
    const organizations = (cookies.organizations || []).filter(
      org => org.subdomain !== organization.subdomain
    );
    res.cookie(
      "organizations",
      organizations,
      authCookieOptions({ domain: `.${coreHost}` })
    );

    if (MAPPING[subdomain]) {
      delete MAPPING[subdomain];
    }

    let DOMAIN = getEnv({ name: "DOMAIN", subdomain: organization.subdomain });

    const oldEndPointUrl = `${DOMAIN}/gateway/pl:integrations`;

    const endPoint = await coreModelEndpoints.findOne({
      endPointUrl: oldEndPointUrl
    });

    // subdomain
    if (endPoint) {
      DOMAIN = getEnv({ name: "DOMAIN", subdomain: link });

      const updatedEndPointUrl = `${DOMAIN}/gateway/pl:integrations`;

      await coreModelEndpoints.updateOne(
        { _id: endPoint._id },
        { endPointUrl: updatedEndPointUrl }
      );
    }
  }

  await redis.set("core_organizations", "");

  return coreModelOrganizations.findOne({ _id: organization._id });
};

export const updateOrganization = async (models, subdomain, updateDoc) => {
  const organization = await getOrganizationDetail({ subdomain, models });

  await coreModelOrganizations.updateOne(
    { _id: organization._id },
    { ...updateDoc },
    { upsert: true }
  );

  await redis.set("core_organizations", "");

  return getOrganizationDetail({ subdomain, models });
};

export const usePromoCode = async ({ subdomain, code, models }) => {
  const promoCode = await coreModelPromoCodes.findOne({ code });

  if (!promoCode) {
    throw new Error("Promo code not found");
  }

  if (
    promoCode.status === PROMOCODE_STATUS.REDEEMED ||
    promoCode.status === PROMOCODE_STATUS.REVOKED
  ) {
    throw new Error("This promo code has been already used");
  }

  const currentOrg = await getOrganizationDetail({ subdomain, models });
  const promoCodes = currentOrg.promoCodes || [];

  if (promoCodes.length === 5) {
    throw new Error("You have already used 5 promo codes");
  }

  await coreModelPromoCodes.update(
    { code },
    {
      $set: {
        status: PROMOCODE_STATUS.REDEEMED,
        usedBy: subdomain,
        usedAt: Date.now()
      }
    }
  );

  const doc: any = { $push: { promoCodes: code } };

  // if promoCode is appsumo's, plan will become 'lifetime'
  if (promoCodes.length === 0 && promoCode.type === PROMO_CODE_TYPE.APPSUMO) {
    doc.$set = { plan: "lifetime", ["charge.phoneNumber.free"]: 1 };
  }

  if (promoCodes.length === 4) {
    doc.$set = { isWhiteLabel: true };
  }

  await updateOrganization(models, subdomain, doc);

  return coreModelPromoCodes.findOne({ code });
};

export const getRelatedOrganizations = async (ownerId: string) => {
  await getCoreConnection();

  const owner = await coreModelUsers.findOne({ _id: ownerId });

  if (owner) {
    return coreModelOrganizations.find({
      _id: { $in: owner.organizationIds || [] }
    });
  }

  return [];
};
