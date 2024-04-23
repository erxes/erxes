
import { generateModels,IContext } from "../../../connectionResolver";
import { IBurenscoring } from "../../../models/definitions/burenscoring";

const burenScoringMutations = {

  toSaveBurenScoring: async (
    _root,
    doc: IBurenscoring,
    { user, subdomain }: IContext
  ) => {
  let data = doc
  if(data?.externalScoringResponse || data?.restInquiryResponse){
    const extRes = doc.externalScoringResponse
    const inquiryRes = doc.restInquiryResponse

    data  = {
      externalScoringResponse: {
        data: {
          uuid: extRes.data.uuid || '',
          requestId: extRes.data.requestId || '',
          detail: extRes.data.detail,
        },
        message: extRes.message || ''
      },
      restInquiryResponse: {
        customer: inquiryRes.customer || {},
        inquiry:  inquiryRes. inquiry || [],
        groupedPurposes: inquiryRes.groupedPurposes || [],
        histories: inquiryRes.histories || []
      },
      score: doc.score || 0,
      customerId: doc.customerId || '',
      reportPurpose: doc.reportPurpose || '',
      keyword: doc.keyword
    }
  }
    const models = await generateModels(subdomain);
    return await models.BurenScorings.createBurenScoring( subdomain, data);

  }
};

export default burenScoringMutations;
