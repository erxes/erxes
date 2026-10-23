import {
  Button,
  SideMenu,
  Tooltip,
  cn,
  useSideMenuContext,
} from 'erxes-ui';
import { RefObject, useEffect, useRef } from 'react';
import { useSidePanel } from 'ui-modules';
import { IconHierarchy2, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ConversationProperties } from './ConversationProperties';

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
            'size-10 rounded bg-sidebar hover:bg-primary/10 [&_svg]:size-5 [&_svg]:text-primary',
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

/**
 * The conversation's right rail: its customer, opened in the app side
 * panel, and the conversation's own properties.
 */
export const ConversationSideWidget = ({
  customerId,
  _id,
  propertiesData,
  asSheet,
  boundaryRef,
}: {
  customerId: string;
  _id: string;
  propertiesData?: Record<string, unknown>;
  asSheet?: boolean;
  boundaryRef: RefObject<HTMLElement>;
}) => {
  const { t } = useTranslation(['frontline', 'common']);
  const sideMenuRef = useRef<HTMLDivElement>(null);

  return (
    <SideMenu ref={sideMenuRef} className="flex-none">
      {asSheet && (
        <SideWidgetOutsideClose
          containerRef={sideMenuRef}
          boundaryRef={boundaryRef}
        />
      )}
      <SideMenu.Content
        value="properties"
        className={cn(sideMenuContentClass(asSheet), 'overflow-y-auto p-4')}
      >
        <ConversationProperties id={_id} propertiesData={propertiesData} />
      </SideMenu.Content>

      <SideMenu.Sidebar>
        {customerId && <CustomerTrigger customerId={customerId} />}
        <SideMenu.Trigger
          value="properties"
          label={t('common:properties', 'Properties')}
          Icon={IconHierarchy2}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
