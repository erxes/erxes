import {
  cn,
  Command,
  type IComposerActionProps,
  Select,
  Spinner,
} from 'erxes-ui';
import { useQuery } from 'erxes-sdk/react';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  RESPONSE_TEMPLATE_CHANNELS,
  RESPONSE_TEMPLATE_COMPOSER_CHANNEL,
  RESPONSE_TEMPLATES_LIST,
} from './graphql';
import { previewText } from './utils';

const ALL = 'all';

/**
 * The composer action: templates of the conversation's or ticket's channel
 * until another channel is picked, and a click inserts one.
 */
export const ResponseTemplatePicker = ({
  insertText,
  contentType,
  contentId,
}: IComposerActionProps) => {
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search.trim(), 300);
  // Until someone picks a channel, the composer's own channel.
  const [picked, setPicked] = useState<string>();

  const composerChannel = useQuery(RESPONSE_TEMPLATE_COMPOSER_CHANNEL, {
    variables: { contentType, contentId },
    skip: !contentId,
  });
  const channels = useQuery(RESPONSE_TEMPLATE_CHANNELS);
  const channelId =
    picked ?? composerChannel.data?.responseTemplatesComposerChannel ?? ALL;
  const list = useQuery(RESPONSE_TEMPLATES_LIST, {
    variables: {
      channelId: channelId === ALL ? undefined : channelId,
      searchValue: searchValue || undefined,
      perPage: 50,
    },
    skip: composerChannel.loading,
  });
  const { loading, error } = list;
  // The last results stay while a new search loads.
  const data = (list.data ?? list.previousData)?.responseTemplatesList;

  return (
    <div className="flex w-96 flex-col gap-2">
      <Select value={channelId} onValueChange={setPicked}>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={ALL}>All channels</Select.Item>
          {channels.data?.responseTemplatesChannels.map((channel) => (
            <Select.Item key={channel._id} value={channel._id}>
              {channel.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Command shouldFilter={false} className="rounded-md border">
        <Command.Input
          variant="secondary"
          focusOnMount
          placeholder="Search templates"
          value={search}
          onValueChange={setSearch}
        />
        <Command.List className="max-h-72">
          {!data && !error && (
            <div className="flex justify-center p-4">
              <Spinner size="sm" />
            </div>
          )}
          {error && (
            <div className="p-4 text-sm text-destructive">{error.message}</div>
          )}
          {data?.list.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchValue ? 'No matching templates' : 'No templates here yet'}
            </div>
          )}
          {data?.list.map((template) => (
            <Command.Item
              key={template._id}
              value={template._id}
              onSelect={() => insertText(template.content)}
              className={cn(
                'h-auto flex-col items-start',
                loading && 'opacity-50',
              )}
            >
              <span className="w-full truncate text-sm font-medium">
                {template.name}
              </span>
              <span className="line-clamp-2 text-xs text-muted-foreground">
                {previewText(template.content)}
              </span>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
};
