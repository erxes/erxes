import { IconChevronDown, IconExternalLink } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { useConversationConvertedItems } from '@/inbox/conversations/hooks/useConversationConvertedItems';
import { ConversationConvertType } from '@/inbox/conversations/types/conversationConvert';
import { ConvertDialog } from './ConvertDialog';
import { CONVERT_TYPES, CONVERT_TYPE_OPTIONS } from './convertForm';

const HOST_PLUGIN_NAME = 'frontline';

export const ConversationConvert = () => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const { _id } = useConversationContext();
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const { hasActionPermission } = usePermissionCheck();
  const { convertedItems, loading } = useConversationConvertedItems(_id);
  const [openType, setOpenType] = useState<ConversationConvertType | null>(
    null,
  );

  const enabledPluginNames = new Set(
    Object.values(pluginsConfig || {}).map((plugin) => plugin?.name),
  );

  const availableTypes = CONVERT_TYPES.filter((type) => {
    const { pluginName, createAction } = CONVERT_TYPE_OPTIONS[type];

    return (
      (pluginName === HOST_PLUGIN_NAME || enabledPluginNames.has(pluginName)) &&
      hasActionPermission(createAction)
    );
  });

  if (
    !_id ||
    !hasActionPermission('conversationConvertToCard') ||
    !availableTypes.length
  ) {
    return null;
  }

  const labels: Record<
    ConversationConvertType,
    { convert: string; goTo: string }
  > = {
    ticket: {
      convert: t('convert-to-a-ticket', 'Convert to a ticket'),
      goTo: t('go-to-a-ticket', 'Go to a ticket'),
    },
    deal: {
      convert: t('convert-to-a-deal', 'Convert to a deal'),
      goTo: t('go-to-a-deal', 'Go to a deal'),
    },
    task: {
      convert: t('convert-to-a-task', 'Convert to a task'),
      goTo: t('go-to-a-task', 'Go to a task'),
    },
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpenType(null);
    }
  };

  const items = availableTypes.map((type) => {
    const converted = convertedItems.find((item) => item.type === type);

    if (converted) {
      return (
        <DropdownMenu.Item key={type} onSelect={() => navigate(converted.url)}>
          <IconExternalLink className="size-4" />
          {labels[type].goTo}
        </DropdownMenu.Item>
      );
    }

    return (
      <DropdownMenu.Item
        key={type}
        disabled={loading}
        onSelect={() => setOpenType(type)}
      >
        {labels[type].convert}
      </DropdownMenu.Item>
    );
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline" className="flex-none shadow-none">
            {t('convert', 'Convert')}
            <IconChevronDown />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="min-w-48">
          {items}
        </DropdownMenu.Content>
      </DropdownMenu>
      <ConvertDialog
        type={openType}
        title={openType ? labels[openType].convert : ''}
        onOpenChange={handleOpenChange}
      />
    </>
  );
};
