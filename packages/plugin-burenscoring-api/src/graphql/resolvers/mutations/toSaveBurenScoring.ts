
import { BurenScoringApi } from "../../../burenScoringConfig/api/getScoring";
import { generateModels,IContext } from "../../../connectionResolver";
import { getConfig } from "../../../messageBroker";
import { IBurenscoring } from "../../../models/definitions/burenscoring";

const burenScoringMutations = {

  toSaveBurenScoring: async (
    _root,
    doc: IBurenscoring,
    { subdomain }: IContext
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

  },
  toCheckScore: async (
    _root,
      { customerId, keyword, reportPurpose }: {customerId: string, keyword: string; reportPurpose: string },
      { subdomain }: IContext
  ) => {
    const config = await getConfig('burenScoringConfig', subdomain, '' )
    if (!config) {
      throw new Error('Buren scoring config not found.');
    }
    const burenConfig = new BurenScoringApi(config);
    const scoring = await burenConfig.getScoring({
      keyword,
      reportPurpose
    });
    
    if(scoring.hasOwnProperty('externalScoringResponse') && scoring.hasOwnProperty('restInquiryResponse') ){
     
      const data: IBurenscoring = scoring
      data.customerId = customerId
      data.keyword = keyword
      data.reportPurpose = reportPurpose
      const models = await generateModels(subdomain);
      return await models.BurenScorings.createBurenScoring( subdomain, data);
    }
    
    throw new Error(scoring.message || 'тооцоолол хийгдэх явцад алдаа гарлаа та мэдээллээ шалгана уу !!');

  }
};

export default burenScoringMutations;
