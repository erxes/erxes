import * as url from "url";
import { checkCNAME, useCloudflareAPI } from "../organizations";
import { configNginx } from "../ingress";
import redis from "@erxes/api-utils/src/redis";
import { coreModelOrganizations } from "@erxes/api-utils/src/saas/saas";

const DNS_STATUS = {
  ACTIVE: "active",
  PENDING: "pending"
};

export default {
  handle10MinutelyJob: async () => {
    console.debug("minutely job is working");

    const organizations = await coreModelOrganizations
      .find({
        isWhiteLabel: true,
        $or: [
          {
            dnsStatus: DNS_STATUS.PENDING
          },
          {
            sslStatus: DNS_STATUS.PENDING
          },
          {
            hostNameStatus: DNS_STATUS.PENDING
          }
        ]
      })
      .lean();

    if (!organizations) {
      return;
    }

    for (const organization of organizations) {
      try {
        const doc: { [key: string]: string | null | undefined | object } = {};
        const {
          _id,
          domain,
          subdomain,
          hostNameStatus,
          sslStatus,
          customDomainStatus
        } = organization;

        const customDomain = url.parse(domain);

        const cnameResolved = await checkCNAME(
          subdomain + ".app.erxes.io",
          customDomain.hostname || ""
        );

        if (cnameResolved) {
          doc.dnsStatus = DNS_STATUS.ACTIVE;

          if (hostNameStatus !== "active" || sslStatus !== "active") {
            const result = await useCloudflareAPI({
              organization,
              type: "get",
              customDomain
            });

            const customDomainStatusDoc = customDomainStatus as any;

            if (result.status === "active") {
              doc.hostNameStatus = DNS_STATUS.ACTIVE;
            }

            if (result?.ssl?.status === "active") {
              doc.sslStatus = DNS_STATUS.ACTIVE;
            } else {
              customDomainStatusDoc.ssl = result.ssl;
            }

            doc.dnsStatus = DNS_STATUS.ACTIVE;
            doc.customDomainStatus = customDomainStatusDoc;

            if (organization.dnsStatus === "pending") {
              await configNginx(subdomain, customDomain.hostname || "");
            }
          }
          await redis.set("core_organizations", "");
          await coreModelOrganizations.updateOne({ _id }, { $set: doc });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
};
