import {
  ICmsAnalyticsQueryArgs,
  ICmsAnalyticsReport,
} from '@/cms/@types/analytics';
import {
  buildEmptyCmsAnalyticsReport,
  getCmsAnalyticsReport,
} from '@/cms/utils/googleAnalytics';
import { requireCmsPermission } from '@/cms/utils/permissions';
import { Resolver } from 'erxes-api-shared/core-types';
import { CMS_POST_ACTIONS } from '~/meta/permissions';
import { IContext } from '~/connectionResolvers';

export const contentCmsAnalyticsQueries: Record<string, Resolver> = {
  cmsAnalytics: async (
    _parent: unknown,
    { clientPortalId, dateRange }: ICmsAnalyticsQueryArgs,
    context: IContext,
  ): Promise<ICmsAnalyticsReport> => {
    await requireCmsPermission(context, CMS_POST_ACTIONS.read);

    const cms = await context.models.CMS.findOne({ clientPortalId });
    const propertyId = cms?.googleAnalyticsPropertyId?.trim();

    if (!propertyId) {
      return buildEmptyCmsAnalyticsReport({
        dateRange,
        propertyIdConfigured: false,
      });
    }

    return getCmsAnalyticsReport({ dateRange, propertyId });
  },
};
