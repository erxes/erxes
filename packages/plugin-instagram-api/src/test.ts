// app.post('/instagram/create-integration', async (req, res, next) => {
//   debugRequest(debugInstagram, req);

//   const { accountId, integrationId, data, kind } = req.body;

//   const instagramPageIds = JSON.parse(data).pageIds;
//   const account = await Accounts.getAccount({ _id: accountId });

//   const facebookPageIds = await getFacebookPageIdsForInsta(
//     account.token,
//     instagramPageIds
//   );

//   const integration = await Integrations.create({
//     kind,
//     accountId,
//     erxesApiId: integrationId,
//     instagramPageIds,
//     facebookPageIds
//   });

//   const facebookPageTokensMap: { [key: string]: string } = {};

//   for (const pageId of facebookPageIds) {
//     try {
//       const pageAccessToken = await getPageAccessToken(pageId, account.token);

//       facebookPageTokensMap[pageId] = pageAccessToken;

//       try {
//         await subscribePage(pageId, pageAccessToken);
//         debugFacebook(`Successfully subscribed page ${pageId}`);
//       } catch (e) {
//         debugError(
//           `Error ocurred while trying to subscribe page ${e.message || e}`
//         );
//         return next(e);
//       }
//     } catch (e) {
//       debugError(
//         `Error ocurred while trying to get page access token with ${
//           e.message || e
//         }`
//       );
//       return next(e);
//     }
//   }

//   integration.facebookPageTokensMap = facebookPageTokensMap;

//   await integration.save();

//   debugResponse(debugInstagram, req);

//   return res.json({ status: 'ok ' });
// });
