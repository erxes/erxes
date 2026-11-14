import { useMemo } from 'react';
import {
  RelationWidgetSideTabs,
  useRelationWidget,
  useRelationWidgetTabs,
} from 'ui-modules';

const DEAL_CONTENT_TYPE = 'sales:deal';

export const DealSideWidgets = ({
  dealId,
  customerId,
  companyId,
}: {
  dealId: string;
  customerId?: string | null;
  companyId?: string | null;
}) => {
  const { relationWidgetsModules } = useRelationWidget({
    contentType: DEAL_CONTENT_TYPE,
  });
  const relationTabs = useRelationWidgetTabs({
    contentType: DEAL_CONTENT_TYPE,
    contentId: dealId,
    customerId: customerId ?? undefined,
    companyId: companyId ?? undefined,
  });

  const dealTabs = useMemo(() => {
    const dealModules = new Set(
      relationWidgetsModules
        .filter((module) => module.contentTypes?.includes(DEAL_CONTENT_TYPE))
        .map((module) => `${module.pluginName}.${module.name}`),
    );

    return relationTabs.filter((tab) => dealModules.has(tab.value));
  }, [relationWidgetsModules, relationTabs]);

  return (
    <RelationWidgetSideTabs
      customerId={customerId}
      companyId={companyId}
      extraTabs={dealTabs}
    />
  );
};
