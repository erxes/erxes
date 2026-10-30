import {
  Button,
  SideMenu,
  Tooltip,
  cn,
  useSideMenuContext,
} from 'erxes-ui';
import { RefObject, useEffect, useRef } from 'react';
import {
  getRelationWidgetLabel,
  useRelationWidget,
  useSidePanel,
} from 'ui-modules';
import { IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const SIDE_MENU_CONTENT_CLASS =
  'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-4 duration-150 motion-reduce:animate-none';

const sideMenuContentClass = (asSheet?: boolean) =>
  cn(
    SIDE_MENU_CONTENT_CLASS,
    asSheet
      ? 'absolute top-11 bottom-0 right-16 z-20 shadow-xl data-[state=active]:w-[min(20rem,calc(100%_-_4rem))]'
      : 'flex-none data-[state=active]:w-72 lg:data-[state=active]:w-80',
  );

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

const CUSTOMER_CONTENT_TYPE = 'core:customer';
const CONVERSATION_CONTENT_TYPE = 'frontline:conversation';
// Records listed by the conversation's customer: the tickets and deals that
// keep that customer (`customerId`), not the conversation they came from.
const CUSTOMER_RECORD_MODULES = ['ticket', 'deals'];

// Opens the customer in the app side panel, where everything linked to them is.
const CustomerTrigger = ({ customerId }: { customerId: string }) => {
  const { t } = useTranslation('frontline');
  const { setActiveTab } = useSideMenuContext();
  const { openRecord, record } = useSidePanel();
  const isOpen =
    record?.contentType === CUSTOMER_CONTENT_TYPE &&
    record.contentId === customerId;
  const label = t('customer', 'Customer');

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={isOpen}
          className={cn(
            'size-10 rounded bg-sidebar hover:bg-primary/10 [&>svg]:size-5 [&_svg]:text-primary',
            isOpen && 'bg-primary/10',
          )}
          onClick={() => {
            setActiveTab();
            openRecord({
              contentType: CUSTOMER_CONTENT_TYPE,
              contentId: customerId,
            });
          }}
        >
          <IconUser />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="left">{label}</Tooltip.Content>
    </Tooltip>
  );
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
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const { RelationWidget, relationWidgetsModules } = useRelationWidget({
    contentType: CONVERSATION_CONTENT_TYPE,
  });
  // Without a customer there is nothing to list the records by.
  const recordModules = customerId
    ? relationWidgetsModules.filter((module) =>
        CUSTOMER_RECORD_MODULES.includes(module.name),
      )
    : [];

  if (!customerId) return null;

  return (
    <SideMenu ref={sideMenuRef} className="flex-none">
      {asSheet && (
        <SideWidgetOutsideClose
          containerRef={sideMenuRef}
          boundaryRef={boundaryRef}
        />
      )}
      {recordModules.map((module) => (
        <SideMenu.Content
          key={module.name}
          value={module.name}
          className={sideMenuContentClass(asSheet)}
        >
          <RelationWidget
            module={module.name}
            pluginName={module.pluginName}
            contentId={_id}
            contentType={CONVERSATION_CONTENT_TYPE}
            customerId={customerId}
          />
        </SideMenu.Content>
      ))}

      <SideMenu.Sidebar>
        {customerId && <CustomerTrigger customerId={customerId} />}
        {recordModules.map((module) => (
          <SideMenu.Trigger
            key={module.name}
            value={module.name}
            label={getRelationWidgetLabel(module)}
            Icon={module.icon}
          />
        ))}
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
