import {
  IconHierarchy2,
  IconHistory,
  IconId,
  IconLink,
  IconLayoutSidebarRight,
} from '@tabler/icons-react';
import { Avatar, Empty, readImage, ScrollArea, Skeleton } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { companyCustomActivities } from '@/contacts/companies/company-detail/CompanyActivityRows';
import { AssistantPanel } from './chat/AssistantPanel';
import { justCreatedRecordState } from '@/side-panel/states/justCreatedRecordState';
import { SidePanelRelations } from './relations/SidePanelRelations';
import { CompanyPanelDetail } from './details/CompanyPanelDetail';
import { CompanyPanelProperties } from './details/CompanyPanelProperties';
import { CustomerPanelDetail } from './details/CustomerPanelDetail';
import { CustomerPanelProperties } from './details/CustomerPanelProperties';
import {
  ActivityLogs,
  AddInternalNote,
  IRecordSidePanelTab,
  RecordSidePanel,
  SIDE_PANEL_CHAT_PATH,
  SIDE_PANEL_ROOT_PATH,
  sidePanelWidthState,
  TRelationEntity,
  useCompanyDetail,
  useCustomerDetail,
  useRelationWidgetTabs,
  useSidePanel,
} from 'ui-modules';

const DETAIL_TAB = 'detail';
const PROPERTIES_TAB = 'properties';
const RELATIONS_TAB = 'relations';
const ACTIVITY_TAB = 'activity';

// The record's own views, for the types core knows how to show.
const getRecordViews = (
  { contentType, contentId }: TRelationEntity,
  isNew: boolean,
) => {
  if (contentType === 'core:customer') {
    return {
      detail: (
        <CustomerPanelDetail customerId={contentId} focusFirstField={isNew} />
      ),
      properties: <CustomerPanelProperties customerId={contentId} />,
    };
  }

  if (contentType === 'core:company') {
    return {
      detail: <CompanyPanelDetail companyId={contentId} />,
      properties: <CompanyPanelProperties companyId={contentId} />,
    };
  }

  return null;
};

const RecordAvatar = ({ src, name }: { src?: string; name?: string }) => (
  <Avatar size="lg" className="size-7 flex-none">
    <Avatar.Image src={readImage(src)} />
    <Avatar.Fallback>{name?.charAt(0)}</Avatar.Fallback>
  </Avatar>
);

// The name and avatar the panel header shows for the open record.
// `sales:deal` reads as "Deal" until a type has a heading of its own.
const getContentTypeLabel = (contentType: string) => {
  const name = contentType.split(':').pop() || contentType;
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const useRecordHeading = ({ contentType, contentId }: TRelationEntity) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  // A record just created has no name yet.
  const untitled = t('untitled', 'Untitled');
  const isCustomer = contentType === 'core:customer';
  const isCompany = contentType === 'core:company';

  const { customerDetail } = useCustomerDetail({
    variables: { _id: contentId },
    skip: !isCustomer,
  });
  const { companyDetail } = useCompanyDetail(
    { variables: { _id: contentId }, skip: !isCompany },
    true,
  );

  if (isCustomer && customerDetail) {
    const { firstName, lastName, primaryEmail, primaryPhone, avatar } =
      customerDetail;
    const title =
      [firstName, lastName].filter(Boolean).join(' ') ||
      primaryEmail ||
      primaryPhone ||
      untitled;

    return { title, avatar: <RecordAvatar src={avatar} name={title} /> };
  }

  if (isCompany && companyDetail) {
    const { primaryName, avatar } = companyDetail;

    const title = primaryName || untitled;

    return {
      title,
      avatar: <RecordAvatar src={avatar} name={title} />,
    };
  }

  // Still loading: placeholders, never the raw content type.
  if (isCustomer || isCompany) {
    return {
      title: <Skeleton className="h-4 w-32" />,
      avatar: <Skeleton className="size-7 flex-none rounded-full" />,
    };
  }

  return { title: getContentTypeLabel(contentType), avatar: undefined };
};

const SidePanelRecord = ({
  record,
  onClose,
}: {
  record: TRelationEntity;
  onClose: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { title, avatar } = useRecordHeading(record);
  // Just created: start on its first field; it has no activity yet.
  const isNew = useAtomValue(justCreatedRecordState) === record.contentId;
  const views = getRecordViews(record, isNew);
  const relationTabs = useRelationWidgetTabs({
    ...record,
    // Linked customers and companies are in the Detail tab already.
    hiddenModules: views ? ['customer', 'company'] : [],
  });
  const [tab, setTab] = useState(views ? DETAIL_TAB : ACTIVITY_TAB);

  const tabs: IRecordSidePanelTab[] = [
    ...(views
      ? [
          {
            value: DETAIL_TAB,
            label: t('detail', 'Detail'),
            icon: IconId,
            content: views.detail,
          },
          {
            value: PROPERTIES_TAB,
            label: t('properties', 'Properties'),
            icon: IconHierarchy2,
            content: views.properties,
          },
        ]
      : []),
    ...(relationTabs.length
      ? [
          {
            value: RELATIONS_TAB,
            label: t('relations', 'Relations'),
            icon: IconLink,
            content: <SidePanelRelations tabs={relationTabs} />,
          },
        ]
      : []),
    ...(isNew
      ? []
      : [
          {
            value: ACTIVITY_TAB,
            label: t('activity', 'Activity'),
            icon: IconHistory,
            content: (
              <div className="flex flex-col flex-1 min-h-0">
                {/* The log and note box are spaced for the wide detail sheet; in the
                    panel both sit 16px in, and the log never widens the panel. */}
                <ScrollArea
                  className="flex-1 min-h-0"
                  viewportClassName="[&>div]:block!"
                >
                  <div className="pt-3 [&_.px-6]:px-2">
                    <ActivityLogs
                      targetId={record.contentId}
                      customActivities={
                        record.contentType === 'core:company'
                          ? companyCustomActivities
                          : undefined
                      }
                      variant="backward"
                    />
                  </div>
                </ScrollArea>
                <div className="shrink-0 pb-4 pt-2 [&_.ml-10]:ml-4 [&_.mr-8]:mr-4">
                  <AddInternalNote
                    contentTypeId={record.contentId}
                    contentType={record.contentType}
                  />
                </div>
              </div>
            ),
          },
        ]),
  ];

  return (
    <>
      <RecordSidePanel.Header avatar={avatar} title={title} onClose={onClose} />
      <RecordSidePanel.Tabs
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
        visibleCount={4}
      />
    </>
  );
};

const SidePanelEmpty = ({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <>
      <RecordSidePanel.Header
        title={t('title', 'Side panel')}
        onClose={onClose}
      />
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconLayoutSidebarRight />
            </Empty.Media>
            <Empty.Title>{title}</Empty.Title>
            <Empty.Description>{description}</Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    </>
  );
};

/**
 * The app-wide side panel: a full-height column right of every app. What it
 * shows is its own route, kept in the `panel` query param
 * (`?panel=/detail/customer/<id>`), so it can be linked and reloaded.
 */
export const SidePanelLayout = () => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { open, path, record, close } = useSidePanel();
  const [width, setWidth] = useAtom(sidePanelWidthState);
  const [justCreated, setJustCreated] = useAtom(justCreatedRecordState);

  // A record stops being "just created" once another one is opened.
  useEffect(() => {
    if (justCreated && record?.contentId !== justCreated) {
      setJustCreated(null);
    }
  }, [justCreated, record?.contentId, setJustCreated]);

  const renderRoute = () => {
    if (record) {
      return (
        <SidePanelRecord
          key={`${record.contentType}:${record.contentId}`}
          record={record}
          onClose={close}
        />
      );
    }

    if (path === SIDE_PANEL_ROOT_PATH) {
      return (
        <SidePanelEmpty
          title={t('empty-title', 'Nothing open')}
          description={t(
            'empty-description',
            'Open a record to see it and everything related to it here.',
          )}
          onClose={close}
        />
      );
    }

    return (
      <SidePanelEmpty
        title={t('not-found-title', 'Nothing here')}
        description={t(
          'not-found-description',
          'This panel link does not point to a record.',
        )}
        onClose={close}
      />
    );
  };

  return (
    <>
      {open && path !== SIDE_PANEL_CHAT_PATH && (
        <RecordSidePanel key="record" width={width} onWidthChange={setWidth}>
          {renderRoute()}
        </RecordSidePanel>
      )}
      <AssistantPanel />
    </>
  );
};
