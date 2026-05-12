// import { IModels } from '~/connectionResolvers';

// const addScore = async ({
//   models,
//   subdomain,
//   execution,
//   serviceName,
//   contentType,
//   config,
// }: {
//   models: IModels;
//   subdomain: string;
//   execution: any;
//   serviceName: string;
//   contentType: string;
//   config: any;
// }) => {
//   //   if (config?.campaignId) {
//   //     return await docScoreCampaign({
//   //       models,
//   //       subdomain,
//   //       contentType,
//   //       execution,
//   //       config,
//   //     });
//   //   }
//   //   const score = await generateScore({
//   //     serviceName,
//   //     models,
//   //     subdomain,
//   //     target: execution.target,
//   //     config,
//   //   });
//   //   if (!!config?.ownerType && !!config?.ownerIds?.length) {
//   //     return await models.ScoreLogs.changeOwnersScore({
//   //       ownerType: config.ownerType,
//   //       ownerIds: config.ownerIds,
//   //       changeScore: score,
//   //       description: "from automation",
//   //     });
//   //   }
//   //   if (config?.attribution) {
//   //     let attributes = generateAttributes(config?.attribution || "");
//   //     if (attributes.includes("triggerExecutor")) {
//   //       const { ownerType, ownerId } = await getOwner({
//   //         models,
//   //         subdomain,
//   //         execution,
//   //         contentType,
//   //         config,
//   //       });
//   //       await models.ScoreLogs.changeOwnersScore({
//   //         ownerType,
//   //         ownerIds: [ownerId],
//   //         changeScore: score,
//   //         description: "from automation",
//   //       });
//   //       attributes = attributes.filter(
//   //         (attribute) => attribute !== "triggerExecutor"
//   //       );
//   //     }
//   //     if (!attributes?.length) {
//   //       return "done";
//   //     }
//   //     const data = {
//   //       target: {
//   //         ...execution?.target,
//   //         customers: null,
//   //         companies: null,
//   //         type: contentType.includes(".")
//   //           ? contentType.split(".")[0]
//   //           : contentType,
//   //       },
//   //       config: {},
//   //       relatedValueProps: {},
//   //     };
//   //     for (const attribute of attributes) {
//   //       data.config[attribute] = `{{ ${attribute} }}`;
//   //       data.relatedValueProps[attribute] = {
//   //         key: "_id",
//   //       };
//   //     }
//   //     const replacedContent = await sendCommonMessage({
//   //       subdomain,
//   //       serviceName,
//   //       action: "automations.replacePlaceHolders",
//   //       data,
//   //       isRPC: true,
//   //       defaultValue: {},
//   //     });
//   //     if (replacedContent["customers"]) {
//   //       await models.ScoreLogs.changeOwnersScore({
//   //         ownerType: "customer",
//   //         ownerIds: await generateIds(replacedContent["customers"]),
//   //         changeScore: score,
//   //         description: "from automation",
//   //       });
//   //     }
//   //     if (replacedContent["companies"]) {
//   //       await models.ScoreLogs.changeOwnersScore({
//   //         ownerType: "company",
//   //         ownerIds: await generateIds(replacedContent["companies"]),
//   //         changeScore: score,
//   //         description: "from automation",
//   //       });
//   //     }
//   //     const replacedContentKeys = Object.keys(replacedContent);
//   //     const teamMemberKeys = replacedContentKeys.filter(
//   //       (key) => !["customers", "companies"].includes(key)
//   //     );
//   //     let teamMemberIds: string[] = [];
//   //     for (const key of teamMemberKeys) {
//   //       teamMemberIds = [
//   //         ...teamMemberIds,
//   //         ...(await generateIds(replacedContent[key])),
//   //       ];
//   //     }
//   //     if (!teamMemberIds?.length) {
//   //       return "done";
//   //     }
//   //     await models.ScoreLogs.changeOwnersScore({
//   //       ownerType: "user",
//   //       ownerIds: teamMemberIds || [],
//   //       changeScore: score,
//   //       description: "from automation",
//   //     });
//   //     return "done";
//   //   }
//   //   return { error: "Not Selected Action configuration" };
// };

// const docScoreCampaign = async ({
//   models,
//   subdomain,
//   contentType,
//   execution,
//   config,
// }: {
//   models: IModels;
//   subdomain: string;
//   contentType: string;
//   execution: any;
//   config: any;
// }) => {
//   //   const { ownerId, ownerType } = await getOwner({
//   //     models,
//   //     subdomain,
//   //     execution,
//   //     contentType,
//   //     config,
//   //   });
//   //   let target = execution.target;
//   //   const [serviceName] = (execution?.triggerType || "").split(":");
//   //   const { extendTargetAutomation } =
//   //     (await getLoyatyCampaignConfig(serviceName)) || {};
//   //   if (extendTargetAutomation) {
//   //     target = await sendCommonMessage({
//   //       subdomain,
//   //       serviceName,
//   //       action: "targetExtender",
//   //       data: {
//   //         target,
//   //         campaignId: config.campaignId,
//   //         actionMethod: config.action,
//   //       },
//   //       isRPC: true,
//   //       defaultValue: target,
//   //     });
//   //   }
//   //   return await models.ScoreCampaigns.doCampaign({
//   //     serviceName,
//   //     targetId: execution.targetId,
//   //     campaignId: config.campaignId,
//   //     actionMethod: config.action,
//   //     ownerId,
//   //     ownerType,
//   //     target,
//   //   });
// };
