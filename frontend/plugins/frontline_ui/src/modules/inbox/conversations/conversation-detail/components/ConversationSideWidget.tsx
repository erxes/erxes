import { IconActivity, IconListDetails } from '@tabler/icons-react';
import {
  FieldsInDetail,
  ActivityLogs,
  AddInternalNote,
  getRelationWidgetLabel,
  useCustomerDetail,
  useCustomerEdit,
  useRelationWidget,
} from 'ui-modules';
import {
  ScrollArea,
  SideMenu,
  Spinner,
  cn,
  toast,
  useSideMenuContext,
} from 'erxes-ui';
import { RefObject, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ACTIVITY_MODULE = {
  name: 'activity',
  icon: IconActivity,
};

const PROPERTIES_MODULE = {
  name: 'properties',
  icon: IconListDetails,
};

const ConversationCustomerActivity = ({
  customerId,
}: {
  customerId: string;
}) => (
  <>
    <SideMenu.Header
      Icon={ACTIVITY_MODULE.icon}
      label={getRelationWidgetLabel(ACTIVITY_MODULE)}
    />
    <ScrollArea className="flex-1 min-h-0">
      <div className="py-3">
        <ActivityLogs targetId={customerId} variant="backward" />
      </div>
    </ScrollArea>
    <div className="shrink-0 py-2">
      <AddInternalNote
        key={customerId}
        contentTypeId={customerId}
        contentType="core:customer"
      />
    </div>
  </>
);

const useInboxCustomerCustomFieldEdit = () => {
  const { t } = useTranslation(['frontline', 'common']);
  const { customerEdit, loading } = useCustomerEdit();

  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) => {
      customerEdit({
        variables: { ...variables },
        onCompleted: () => {
          toast({
            title: t('common:properties'),
            description: t('save-successful'),
          });
        },
      });
    },
    loading,
  };
};

const ConversationCustomerProperties = ({
  customerId,
}: {
  customerId: string;
}) => {
  const { t } = useTranslation(['frontline', 'common']);
  const { customerDetail, loading, error } = useCustomerDetail({
    variables: { _id: customerId },
    fetchPolicy: 'cache-and-network',
  });

  let content = (
    <div className="p-4 text-sm text-muted-foreground">
      {t('no-custom-properties-found')}
    </div>
  );

  if (loading && !customerDetail) {
    content = <Spinner containerClassName="py-12" />;
  } else if (error) {
    content = (
      <div className="p-4 text-sm text-destructive">
        <p>
          {t('common:load-error', {
            label: t('common:properties'),
          })}
        </p>
        <p>{error.message}</p>
      </div>
    );
  } else if (customerDetail) {
    content = (
      <div className="p-4">
        <FieldsInDetail
          fieldContentType="core:customer"
          propertiesData={customerDetail.propertiesData || {}}
          mutateHook={useInboxCustomerCustomFieldEdit}
          id={customerId}
        />
      </div>
    );
  }

  return (
    <>
      <SideMenu.Header
        Icon={PROPERTIES_MODULE.icon}
        label={t('common:properties')}
      />
      <ScrollArea className="flex-1 min-h-0">{content}</ScrollArea>
    </>
  );
};

// Bounded to the conversation area so the widget's own portals do not count.
const SideWidgetOutsideClose = ({
  containerRef,
  boundaryRef,
}: {
  containerRef: RefObject<HTMLDivElement>;
  boundaryRef: RefObject<HTMLElement>;
}) => {
  const { activeTab, setActiveTab } = useSideMenuContext();

  useEffect(() => {
    if (!activeTab) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const container = containerRef.current;
      const boundary = boundaryRef.current;
      const isOutside =
        target !== null &&
        container !== null &&
        boundary !== null &&
        boundary.contains(target) &&
        !container.contains(target);

      if (isOutside) {
        setActiveTab();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [activeTab, boundaryRef, containerRef, setActiveTab]);

  return null;
};

export const ConversationSideWidget = ({
  customerId,
  _id,
  asSheet,
  boundaryRef,
}: {
  customerId: string;
  _id: string;
  asSheet?: boolean;
  boundaryRef: RefObject<HTMLElement>;
}) => {
  const { t } = useTranslation('common');
  const { relationWidgetsModules, RelationWidget } = useRelationWidget();
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const contentClassName = cn(
    'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-4 duration-150 motion-reduce:animate-none',
    asSheet
      ? 'absolute top-11 bottom-0 right-16 z-20 shadow-xl data-[state=active]:w-[min(20rem,calc(100%_-_4rem))]'
      : 'flex-none data-[state=active]:w-72 lg:data-[state=active]:w-80',
  );

  return (
    <SideMenu ref={sideMenuRef} className="flex-none">
      {asSheet && (
        <SideWidgetOutsideClose
          containerRef={sideMenuRef}
          boundaryRef={boundaryRef}
        />
      )}
      {relationWidgetsModules.map((module) => {
        return (
          <SideMenu.Content
            value={module.name}
            key={module.name}
            className={contentClassName}
          >
            <RelationWidget
              key={module.name}
              module={module.name}
              pluginName={module.pluginName}
              contentId={_id}
              contentType="frontline:conversation"
              customerId={customerId}
            />
          </SideMenu.Content>
        );
      })}
      {!!customerId && (
        <SideMenu.Content
          value={ACTIVITY_MODULE.name}
          className={contentClassName}
        >
          <ConversationCustomerActivity customerId={customerId} />
        </SideMenu.Content>
      )}
      {!!customerId && (
        <SideMenu.Content
          value={PROPERTIES_MODULE.name}
          className={contentClassName}
        >
          <ConversationCustomerProperties customerId={customerId} />
        </SideMenu.Content>
      )}

      <SideMenu.Sidebar>
        {relationWidgetsModules.map((module) => {
          return (
            <SideMenu.Trigger
              key={module.name}
              value={module.name}
              label={getRelationWidgetLabel(module)}
              Icon={module.icon}
            />
          );
        })}
        {!!customerId && (
          <SideMenu.Trigger
            value={ACTIVITY_MODULE.name}
            label={getRelationWidgetLabel(ACTIVITY_MODULE)}
            Icon={ACTIVITY_MODULE.icon}
          />
        )}
        {!!customerId && (
          <SideMenu.Trigger
            value={PROPERTIES_MODULE.name}
            label={t('properties')}
            Icon={PROPERTIES_MODULE.icon}
          />
        )}
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
