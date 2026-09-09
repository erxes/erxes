import {
  IconAlertTriangle,
  IconBolt,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconExternalLink,
  IconInfoCircle,
  IconPlayerPlay,
} from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Button,
  Label,
  ToggleGroup,
  Tooltip,
  cn,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  buildAutomationSeedLink,
  generateAutomationElementId,
} from 'ui-modules';
import {
  FACEBOOK_MESSAGE_ACTION_TYPE,
  FACEBOOK_MESSAGE_TRIGGER_TYPE,
} from '~/widgets/automations/modules/facebook/components/bots/constants';
import {
  MessengerFrame,
  TMessengerDevice,
} from '~/widgets/automations/modules/facebook/components/bots/components/simulator/MessengerFrame';
import { useFbBotFormContext } from '~/widgets/automations/modules/facebook/components/bots/context/FbBotFormContext';
import { useFacebookBotAutomations } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAutomations';
import { useFacebookBotPages } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotPages';
import {
  FACEBOOK_PERSISTENT_MENU_LIMIT,
  GET_STARTED_KEY,
  TMessengerIceBreakerPreviewItem,
  TMessengerMenuPreviewItem,
  buildMessengerProfilePreview,
} from '~/widgets/automations/modules/facebook/components/bots/utils/buildMessengerProfilePreview';
import {
  TBotMenuOutcome,
  resolveBotMenuOutcome,
  resolveDirectMessageOutcome,
  resolveIceBreakerOutcome,
} from '~/widgets/automations/modules/facebook/components/bots/utils/resolveBotMenuOutcome';

type TSimulatorView = 'welcome' | 'conversation';

export const FacebookBotSimulator = () => {
  const { t } = useTranslation('frontline');
  const { form, facebookMessengerBot } = useFbBotFormContext();
  const [view, setView] = useState<TSimulatorView>('welcome');
  const [device, setDevice] = useState<TMessengerDevice>('mobile');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedItemKey, setSelectedItemKey] = useState<string>();
  const [composerValue, setComposerValue] = useState('');

  const [
    accountId,
    pageId,
    persistentMenus,
    iceBreakers,
    getStartedText,
    greetText,
    isEnabledBackBtn,
  ] = form.watch([
    'accountId',
    'pageId',
    'persistentMenus',
    'iceBreakers',
    'getStartedText',
    'greetText',
    'isEnabledBackBtn',
  ]);

  const { page } = useFacebookBotPages(accountId, pageId);
  const { automations } = useFacebookBotAutomations(facebookMessengerBot?._id);
  const preview = buildMessengerProfilePreview({
    persistentMenus,
    iceBreakers,
    getStartedText,
    greetText,
    isEnabledBackBtn,
  });

  // A trigger condition points at menu and ice breaker ids, and those only
  // exist once the bot is saved. Anything added since is not addressable yet.
  const savedKeys = useMemo(
    () =>
      new Set([
        ...(facebookMessengerBot?.persistentMenus || []).map(({ _id }) => _id),
        ...(facebookMessengerBot?.iceBreakers || []).map(({ _id }) => _id),
      ]),
    [facebookMessengerBot],
  );

  const selectedItem = preview.items.find(
    (item) => item.key === selectedItemKey,
  );
  const selectedIceBreaker = preview.iceBreakers.find(
    (item) => item.key === selectedItemKey,
  );

  const selectionKey = selectedItem?.sourceId || selectedIceBreaker?.key;
  const isSelectionUnsaved = Boolean(
    selectionKey && !savedKeys.has(selectionKey),
  );

  const seedLink = useMemo(() => {
    const conditions = buildSeedCondition({
      item: selectedItem,
      iceBreaker: selectedIceBreaker,
      message: composerValue.trim(),
    });

    if (!conditions || !facebookMessengerBot?._id || isSelectionUnsaved) {
      return undefined;
    }

    return buildAutomationSeedLink({
      triggerType: FACEBOOK_MESSAGE_TRIGGER_TYPE,
      triggerConfig: { botId: facebookMessengerBot._id, conditions },
      actionType: FACEBOOK_MESSAGE_ACTION_TYPE,
      name: facebookMessengerBot.name,
    });
  }, [
    composerValue,
    facebookMessengerBot,
    isSelectionUnsaved,
    selectedIceBreaker,
    selectedItem,
  ]);

  const selectedOutcome = composerValue.trim()
    ? {
        title: composerValue,
        outcome: resolveDirectMessageOutcome(composerValue, automations),
      }
    : selectedItem
    ? {
        title: selectedItem.title,
        outcome: resolveBotMenuOutcome(selectedItem, automations),
      }
    : selectedIceBreaker
    ? {
        title: selectedIceBreaker.question,
        outcome: resolveIceBreakerOutcome(selectedIceBreaker, automations),
      }
    : undefined;

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>
          {t('messenger-preview', { defaultValue: 'Messenger preview' })}
        </Label>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={device}
            onValueChange={(value) =>
              value && setDevice(value as TMessengerDevice)
            }
          >
            <DeviceToggleItem
              value="mobile"
              label={t('mobile', { defaultValue: 'Mobile' })}
            >
              <IconDeviceMobile className="size-4" />
            </DeviceToggleItem>
            <DeviceToggleItem
              value="desktop"
              label={t('desktop', { defaultValue: 'Desktop' })}
            >
              <IconDeviceDesktop className="size-4" />
            </DeviceToggleItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={view}
            onValueChange={(value) => value && setView(value as TSimulatorView)}
          >
            <ToggleGroup.Item value="welcome">
              {t('welcome-screen', { defaultValue: 'Welcome' })}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="conversation">
              {t('conversation', { defaultValue: 'Conversation' })}
            </ToggleGroup.Item>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <MessengerFrame
          device={device}
          pageName={page?.name || t('your-page', { defaultValue: 'Your page' })}
          profileUrl={facebookMessengerBot?.profileUrl}
          isMenuOpen={isMenuOpen}
          onToggleMenu={() => setMenuOpen((open) => !open)}
          composerValue={composerValue}
          onComposerChange={setComposerValue}
          overlay={
            <>
              {isMenuOpen && (
                <PersistentMenuSheet
                  items={preview.items}
                  device={device}
                  savedKeys={savedKeys}
                  selectedKey={selectedItemKey}
                  onSelect={setSelectedItemKey}
                />
              )}
              {view === 'welcome' && !isMenuOpen && (
                <GetStartedButton
                  title={preview.items[0].title}
                  isSelected={selectedItemKey === GET_STARTED_KEY}
                  onSelect={() => setSelectedItemKey(GET_STARTED_KEY)}
                />
              )}
            </>
          }
        >
          <div key={view} className="h-full animate-in fade-in-0 duration-200">
            {view === 'welcome' ? (
              <WelcomeScreen
                pageName={page?.name || ''}
                profileUrl={facebookMessengerBot?.profileUrl}
                greeting={preview.greeting}
                iceBreakers={preview.iceBreakers}
                savedKeys={savedKeys}
                selectedKey={selectedItemKey}
                onSelect={setSelectedItemKey}
              />
            ) : (
              <ConversationScreen />
            )}
          </div>
        </MessengerFrame>
      </div>

      {selectedOutcome ? (
        <MenuOutcome
          title={selectedOutcome.title}
          outcome={selectedOutcome.outcome}
          hasBot={Boolean(facebookMessengerBot?._id)}
          isTyped={Boolean(composerValue.trim())}
          seedLink={seedLink}
          isUnsaved={isSelectionUnsaved}
        />
      ) : (
        <SimulatorNotices
          greetingWarning={preview.greetingWarning}
          droppedCount={preview.droppedCount}
          isOverLimit={preview.isOverLimit}
          itemCount={preview.items.length}
        />
      )}
    </div>
  );
};

const DeviceToggleItem = ({
  value,
  label,
  children,
}: {
  value: TMessengerDevice;
  label: string;
  children: React.ReactNode;
}) => (
  <Tooltip.Provider>
    <Tooltip delayDuration={200}>
      <Tooltip.Trigger asChild>
        <ToggleGroup.Item value={value} aria-label={label}>
          {children}
        </ToggleGroup.Item>
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  </Tooltip.Provider>
);

const WelcomeScreen = ({
  pageName,
  profileUrl,
  greeting,
  iceBreakers,
  savedKeys,
  selectedKey,
  onSelect,
}: {
  pageName: string;
  profileUrl?: string;
  greeting?: string;
  iceBreakers: TMessengerIceBreakerPreviewItem[];
  savedKeys: Set<string>;
  selectedKey?: string;
  onSelect: (key: string) => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <Avatar className="size-14">
        <Avatar.Image src={profileUrl} />
        <Avatar.Fallback>{(pageName || '?').charAt(0)}</Avatar.Fallback>
      </Avatar>
      <div className="text-sm font-semibold">{pageName}</div>
      {greeting ? (
        <p
          key={greeting}
          className="animate-in fade-in-0 text-xs text-muted-foreground duration-200"
        >
          {greeting}
        </p>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          {t('no-greeting-preview', {
            defaultValue:
              'No greeting set, so Facebook shows only the page name here.',
          })}
        </p>
      )}
      {iceBreakers.length > 0 && (
        <div className="mt-2 flex w-full flex-col items-center gap-1.5">
          <span className="text-xs font-semibold">
            {t('tap-to-send', { defaultValue: 'Tap to send' })}
          </span>
          {iceBreakers.map(({ key, question }) => (
            <button
              type="button"
              key={key}
              onClick={() => onSelect(key)}
              className={cn(
                'animate-in fade-in-0 slide-in-from-bottom-1 max-w-full truncate rounded-full border px-3 py-1.5 text-xs text-primary transition-colors duration-200 hover:bg-accent',
                selectedKey === key && 'bg-accent',
              )}
            >
              {question}
              {!savedKeys.has(key) && <UnsavedBadge className="ml-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ConversationScreen = () => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-[80%] animate-in slide-in-from-bottom-2 fade-in-0 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-xs duration-300">
        {t('conversation-preview-message', {
          defaultValue: 'Open the menu below to see what a visitor gets.',
        })}
      </div>
    </div>
  );
};

const UnsavedBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation('frontline');

  return (
    <Badge variant="secondary" className={className}>
      {t('unsaved', { defaultValue: 'unsaved' })}
    </Badge>
  );
};

const GetStartedButton = ({
  title,
  isSelected,
  onSelect,
}: {
  title: string;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div className="animate-in fade-in-0 border-t px-3 py-2 duration-200">
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full truncate rounded-full bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90',
        isSelected && 'opacity-90 ring-2 ring-primary/40',
      )}
    >
      {title}
    </button>
  </div>
);

const PersistentMenuSheet = ({
  items,
  device,
  savedKeys,
  selectedKey,
  onSelect,
}: {
  items: TMessengerMenuPreviewItem[];
  device: TMessengerDevice;
  savedKeys: Set<string>;
  selectedKey?: string;
  onSelect: (key: string) => void;
}) => (
  <div
    className={cn(
      'animate-in slide-in-from-bottom-4 fade-in-0 bg-background duration-200',
      device === 'mobile'
        ? 'border-t'
        : 'mx-3 mb-1 rounded-md border shadow-md',
    )}
  >
    {device === 'mobile' && (
      <div className="mx-auto my-2 h-1 w-8 rounded-full bg-muted-foreground/40" />
    )}
    {items.map((item, index) => (
      <button
        type="button"
        key={item.key}
        onClick={() => onSelect(item.key)}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors hover:bg-accent',
          index > 0 && 'border-t',
          selectedKey === item.key && 'bg-accent',
        )}
      >
        <span className="flex-1 truncate">{item.title}</span>
        {item.sourceId && !savedKeys.has(item.sourceId) && <UnsavedBadge />}
        {item.kind === 'webUrl' && (
          <IconExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        {item.kind === 'getStarted' && (
          <Badge variant="secondary">Get Started</Badge>
        )}
        {item.warning && (
          <IconAlertTriangle className="size-3.5 shrink-0 text-warning" />
        )}
      </button>
    ))}
  </div>
);

/**
 * The trigger condition that would catch this exact interaction, in the shape
 * `checkMessageTrigger` reads. A web_url or a back action never reaches erxes,
 * so neither can be listened for.
 */
const buildSeedCondition = ({
  item,
  iceBreaker,
  message,
}: {
  item?: TMessengerMenuPreviewItem;
  iceBreaker?: TMessengerIceBreakerPreviewItem;
  message: string;
}) => {
  const base = { _id: generateAutomationElementId(), isSelected: true };

  if (message) {
    return [
      {
        ...base,
        type: 'direct',
        conditions: [
          {
            _id: generateAutomationElementId(),
            operator: 'isEqual',
            keywords: [{ _id: generateAutomationElementId(), text: message }],
          },
        ],
      },
    ];
  }

  if (iceBreaker) {
    return [{ ...base, type: 'iceBreaker', iceBreakerIds: [iceBreaker.key] }];
  }

  if (item?.kind === 'getStarted') {
    return [{ ...base, type: 'getStarted' }];
  }

  // Only a plain button survives to the trigger; a link, a handoff and a back
  // action are all consumed before it.
  if (item?.sourceType === 'button' && item.sourceId) {
    return [
      { ...base, type: 'persistentMenu', persistentMenuIds: [item.sourceId] },
    ];
  }

  return undefined;
};

const MenuOutcome = ({
  title,
  outcome,
  hasBot,
  isTyped,
  seedLink,
  isUnsaved,
}: {
  title: string;
  outcome: TBotMenuOutcome;
  hasBot: boolean;
  isTyped?: boolean;
  seedLink?: string;
  isUnsaved?: boolean;
}) => {
  const { t } = useTranslation('frontline');

  const body = () => {
    if (outcome.kind === 'opensLink') {
      return t('menu-outcome-link', {
        defaultValue:
          'Facebook opens {{url}} in a webview. Nothing reaches erxes.',
        url: outcome.url,
      });
    }

    if (outcome.kind === 'handsOffToHuman') {
      return t('menu-outcome-handoff', {
        defaultValue:
          'Hands the conversation to a person and pauses automated replies. No automation runs.',
      });
    }

    if (outcome.kind === 'resumesWait') {
      return t('menu-outcome-back', {
        defaultValue:
          'Resumes the visitor’s paused step instead of starting a new automation.',
      });
    }

    if (outcome.kind === 'noListener') {
      if (!hasBot) {
        return t('menu-outcome-unsaved', {
          defaultValue: 'Save the bot to see which automations respond.',
        });
      }

      return isUnsaved
        ? t('menu-outcome-unsaved-item', {
            defaultValue:
              'Not saved yet, so no automation can point at it. Save the bot first.',
          })
        : t('menu-outcome-none', {
            defaultValue: 'No automation is listening for this action.',
          });
    }

    return null;
  };

  const startedCount =
    outcome.kind === 'startsAutomations' ? outcome.automations.length : 0;

  return (
    <div className="animate-in fade-in-0 flex shrink-0 flex-col gap-1.5 duration-200">
      <div className="flex items-center gap-2 text-xs font-medium">
        {isTyped
          ? t('message-outcome-title', {
              defaultValue: 'Sending “{{title}}”',
              title,
            })
          : t('menu-outcome-title', {
              defaultValue: 'Tapping “{{title}}”',
              title,
            })}
        {startedCount > 0 && <Badge variant="secondary">{startedCount}</Badge>}
      </div>
      {outcome.kind === 'startsAutomations' ? (
        <div className="flex max-h-32 flex-col gap-1.5 overflow-y-auto">
          {outcome.automations.map(({ _id, name, status }) => (
            <Link
              key={_id}
              to={`/automations/edit/${_id}`}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <IconPlayerPlay className="size-3.5 shrink-0" />
              <span className="truncate">{name}</span>
              {status !== 'active' && (
                <Badge variant="secondary">{status || 'draft'}</Badge>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-1.5">
          <p className="text-xs text-muted-foreground">{body()}</p>
          {outcome.kind === 'noListener' && seedLink && (
            <Button variant="secondary" size="sm" asChild>
              <Link to={seedLink}>
                <IconBolt />
                {t('create-automation-for-this', {
                  defaultValue: 'Create an automation for this',
                })}
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const SimulatorNotices = ({
  greetingWarning,
  droppedCount,
  isOverLimit,
  itemCount,
}: {
  greetingWarning?: string;
  droppedCount: number;
  isOverLimit: boolean;
  itemCount: number;
}) => {
  const { t } = useTranslation('frontline');

  const notices = [
    isOverLimit && {
      variant: 'destructive' as const,
      // `total` rather than `count`: i18next would read `count` as a plural
      // selector and look for suffixed keys that do not exist here.
      text: t('menu-over-limit', {
        defaultValue:
          'Facebook accepts {{limit}} menu actions; this bot sends {{total}}, including its own Get Started.',
        limit: FACEBOOK_PERSISTENT_MENU_LIMIT,
        total: itemCount,
      }),
    },
    droppedCount > 0 && {
      variant: 'warning' as const,
      text: t('menu-items-dropped', {
        defaultValue:
          '{{count}} menu items have no text and never reach Facebook.',
        count: droppedCount,
      }),
    },
    greetingWarning && { variant: 'warning' as const, text: greetingWarning },
  ].filter(Boolean) as { variant: 'destructive' | 'warning'; text: string }[];

  if (!notices.length) {
    return (
      <p className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        <IconInfoCircle className="size-3.5 shrink-0" />
        {t('menu-preview-note', {
          defaultValue:
            'Facebook always adds Get Started as the first menu action.',
        })}
      </p>
    );
  }

  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      {notices.map(({ variant, text }) => (
        <Badge
          key={text}
          variant={variant}
          className="h-auto whitespace-normal py-1"
        >
          {text}
        </Badge>
      ))}
    </div>
  );
};
