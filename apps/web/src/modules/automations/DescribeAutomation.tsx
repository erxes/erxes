import { IconSparkles } from '@tabler/icons-react';
import { Button, Dialog, Textarea } from 'erxes-ui';
import { type SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAskAssistant } from '~/modules/assistant/useAskAssistant';

export const DescribeAutomation = () => {
  const { t } = useTranslation('automations');
  const ask = useAskAssistant();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const request = text.trim();

  if (!ask) return null;

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();

    if (!request) return;

    ask(`Create an automation: ${request}`);
    setText('');
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <IconSparkles />
        {t('describe', 'Describe it')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.HeaderCombined
            title={t('describe-title', 'Tell the assistant what should happen')}
            description={t(
              'describe-description',
              'It builds a draft for you to check. Nothing runs until you turn it on.',
            )}
          />
          <form className="space-y-3" onSubmit={submit}>
            <Textarea
              rows={4}
              value={text}
              aria-label={t('describe-title', 'Tell the assistant what should happen')}
              placeholder={t(
                'describe-placeholder',
                'When a new customer is added, create a task for sales and send a welcome email two days later.',
              )}
              onChange={(event) => setText(event.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!request}>
                <IconSparkles />
                {t('describe-submit', 'Build the draft')}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
