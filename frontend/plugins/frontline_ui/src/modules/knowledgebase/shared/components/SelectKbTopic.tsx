import {
  Combobox,
  Command,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTopicOptions } from '@/knowledgebase/topics/hooks/useTopics';

export const SelectKbTopic = ({
  value,
  onValueChange,
  scope,
}: {
  value?: string;
  onValueChange: (topicId: string) => void;
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const { topics, loading } = useTopicOptions();

  const selected = topics.find((topic) => topic._id === value);

  const handleSelect = (topicId: string) => {
    onValueChange(topicId);
    setOpen(false);
  };

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-full h-8 font-medium">
        <TextOverflowTooltip
          value={
            selected?.title || t('kb-select-topic', 'Select a knowledge base')
          }
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input
            placeholder={t('kb-search-topics', 'Search knowledge bases')}
          />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {topics.map((topic) => (
              <Command.Item
                key={topic._id}
                value={`${topic.title} ${topic._id}`}
                onSelect={() => handleSelect(topic._id)}
              >
                <TextOverflowTooltip
                  value={topic.title || t('unnamed-topic', 'Unnamed topic')}
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
