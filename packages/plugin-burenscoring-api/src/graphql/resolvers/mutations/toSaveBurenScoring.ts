import { BurenScoringApi } from '../../../burenScoringConfig/api/getScoring';
import { generateModels, IContext } from '../../../connectionResolver';
import { getBurenScoringConfig } from '../../../messageBroker';
import { IBurenscoring } from '../../../models/definitions/burenscoring';
import { otherPlugins } from '../../../utils';

const burenScoringMutations = {
  toSaveBurenScoring: async (
    _root,
    doc: IBurenscoring,
    { subdomain }: IContext
  ) => {
    let data = doc;
    if (data?.externalScoringResponse || data?.restInquiryResponse) {
      const extRes = doc.externalScoringResponse;
      const inquiryRes = doc.restInquiryResponse;
      data = {
        externalScoringResponse: {
          data: {
            uuid: extRes.data.uuid || '',
            requestId: extRes.data.requestId || '',
            detail: extRes.data.detail,
          },
          message: extRes.message || '',
        },
        restInquiryResponse: {
          customer: inquiryRes.customer || {},
          inquiry: inquiryRes.inquiry || [],
          groupedPurposes: inquiryRes.groupedPurposes || [],
          histories: inquiryRes.histories || [],
        },
        score: doc.score || 0,
        customerId: doc.customerId || '',
        reportPurpose: doc.reportPurpose || '',
        keyword: doc.keyword,
        vendor: doc.vendor,
      };
    }
    const models = await generateModels(subdomain);

    return await models.BurenScorings.createBurenScoring(subdomain, data);
  },

  toCheckScore: async (
    _root,
    {
      customerId,
      keyword,
      reportPurpose,
      vendor,
    }: {
      customerId: string;
      keyword: string;
      reportPurpose: string;
      vendor: string;
    },
    { subdomain }: IContext
  ) => {
    const config = await getBurenScoringConfig('burenScoringConfig', subdomain);
    if (!config) {
      throw new Error('Buren scoring config not found.');
    }
    const burenConfig = new BurenScoringApi(config);
    const scoring = await burenConfig.getScoring({
      keyword,
      reportPurpose,
      vendor,
    });

    if (
      scoring.hasOwnProperty('externalScoringResponse') &&
      scoring.hasOwnProperty('restInquiryResponse')
    ) {
      const extRes = scoring.externalScoringResponse;
      const inquiryRes = scoring.restInquiryResponse;
      const data: IBurenscoring = {
        externalScoringResponse: {
          data: {
            uuid: extRes.data.uuid || '',
            requestId: extRes.data.requestId || '',
            detail: extRes.data.detail,
          },
          message: extRes.message || '',
        },
        restInquiryResponse: {
          customer: inquiryRes.customer || {},
          inquiry: inquiryRes.inquiry || [],
          groupedPurposes: inquiryRes.groupedPurposes || [],
          histories: inquiryRes.histories || [],
        },
        score: scoring.score || 0,
        customerId: customerId || '',
        reportPurpose: reportPurpose || '',
        keyword: keyword,
        vendor: scoring.vendor || 'AND_SCORING',
      };
      const models = await generateModels(subdomain);

      await otherPlugins(subdomain, data);
      return await models.BurenScorings.createBurenScoring(subdomain, data);
    } else {
      throw new Error(scoring.message);
    }
  },
};

export default burenScoringMutations;
