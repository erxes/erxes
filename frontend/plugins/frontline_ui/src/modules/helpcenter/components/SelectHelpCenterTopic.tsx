import { useQuery } from '@apollo/client';
import {
  Combobox,
  Command,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_HELP_CENTER_TOPIC_OPTIONS } from '@/helpcenter/graphql/queries/getHelpCenterTopicOptions';
import { SelectTriggerTicket } from '@/ticket/components/ticket-selects/SelectTicket';

type TTopicOption = { _id: string; title?: string };

export const SelectHelpCenterTopic = ({
  value,
  onValueChange,
  variant,
  scope,
}: {
  value: string;
  onValueChange: (topicId: string) => void;
  variant: 'table' | 'form';
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const { data, loading } = useQuery<{
    knowledgeBaseTopics: TTopicOption[];
  }>(GET_HELP_CENTER_TOPIC_OPTIONS, { variables: { perPage: 100 } });

  const topics = data?.knowledgeBaseTopics ?? [];
  const selected = topics.find((topic) => topic._id === value);

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <SelectTriggerTicket variant={variant}>
        <TextOverflowTooltip
          value={selected?.title || t('select-topic', 'Select a topic')}
        />
      </SelectTriggerTicket>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('search-topics', 'Search topics')} />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {topics.map((topic) => (
              <Command.Item
                key={topic._id}
                value={topic._id}
                onSelect={() => {
                  onValueChange(topic._id);
                  setOpen(false);
                }}
              >
                <TextOverflowTooltip
                  value={topic.title || t('unnamed-topic')}
                />
                <Combobox.Check checked={value === topic._id} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
