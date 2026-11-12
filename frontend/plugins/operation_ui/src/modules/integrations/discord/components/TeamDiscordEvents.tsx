import { UseFormReturn } from 'react-hook-form';
import { Alert, Checkbox, cn, Form, Select } from 'erxes-ui';
import { DISCORD_EVENT_OPTIONS, DISCORD_MENTION_OPTIONS } from '../constants';
import { TDiscordTeamConfigForm } from '../schemas';
import { TDiscordNotificationEvent } from '../types';

type TDiscordEventOption = (typeof DISCORD_EVENT_OPTIONS)[number];

const COLUMN_HEADER_CLASS =
  'font-mono text-xs font-semibold uppercase leading-none text-accent-foreground';

const describeEventOption = (
  option: TDiscordEventOption,
  githubRepoName?: string,
) => {
  if (!option.requiresGithubRepo) {
    return option.description;
  }

  return githubRepoName
    ? `A pull request is merged in ${githubRepoName}.`
    : 'Link a GitHub repository to this team in its GitHub settings first.';
};

const toggleEvent = (
  list: TDiscordNotificationEvent[],
  event: TDiscordNotificationEvent,
  checked: boolean,
) => (checked ? [...list, event] : list.filter((item) => item !== event));

function TeamDiscordEventRow({
  option,
  description,
  sent,
  mentioned,
  sendDisabled,
  mentionDisabled,
  onSendChange,
  onMentionChange,
}: Readonly<{
  option: TDiscordEventOption;
  description: string;
  sent: boolean;
  mentioned: boolean;
  sendDisabled: boolean;
  mentionDisabled: boolean;
  onSendChange: (checked: boolean) => void;
  onMentionChange: (checked: boolean) => void;
}>) {
  const sendId = `discord-event-send-${option.value}`;

  return (
    <>
      <label
        htmlFor={sendId}
        className={cn(
          'min-w-0',
          sendDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        )}
      >
        <span className="block text-sm font-medium">{option.label}</span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </label>
      <Checkbox
        id={sendId}
        className="mt-0.5 justify-self-center"
        aria-label={`Send ${option.label}`}
        checked={sent}
        disabled={sendDisabled}
        onCheckedChange={(checked) => onSendChange(checked === true)}
      />
      <Checkbox
        className="mt-0.5 justify-self-center"
        aria-label={`Mention on ${option.label}`}
        checked={mentioned}
        disabled={mentionDisabled}
        onCheckedChange={(checked) => onMentionChange(checked === true)}
      />
    </>
  );
}

export function TeamDiscordEvents({
  form,
  githubRepoName,
  channelName,
}: Readonly<{
  form: UseFormReturn<TDiscordTeamConfigForm>;
  githubRepoName?: string;
  channelName?: string;
}>) {
  const mention = form.watch('mention');
  const events = form.watch('events');
  const mentionEvents = form.watch('mentionEvents');
  const mentionOption = DISCORD_MENTION_OPTIONS.find(
    (option) => option.value === mention,
  );
  const mentionsSomeone =
    mention !== 'none' && mentionEvents.some((event) => events.includes(event));

  function handleSendChange(
    event: TDiscordNotificationEvent,
    checked: boolean,
  ) {
    form.setValue('events', toggleEvent(events, event, checked), {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!checked) {
      form.setValue(
        'mentionEvents',
        mentionEvents.filter((item) => item !== event),
        { shouldDirty: true },
      );
    }
  }

  function handleMentionChange(
    event: TDiscordNotificationEvent,
    checked: boolean,
  ) {
    form.setValue('mentionEvents', toggleEvent(mentionEvents, event, checked), {
      shouldDirty: true,
    });
  }

  return (
    <>
      <Form.Field
        control={form.control}
        name="mention"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Mention</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Nobody" />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {DISCORD_MENTION_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Description>
              {mentionOption?.description} It applies to the events ticked under
              Mention.
            </Form.Description>
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="events"
        render={() => (
          <Form.Item>
            <div className="grid grid-cols-[1fr_auto_auto] items-start gap-x-6 gap-y-3">
              <Form.Label>Events</Form.Label>
              <span className={COLUMN_HEADER_CLASS}>Send</span>
              <span
                className={cn(
                  COLUMN_HEADER_CLASS,
                  mention === 'none' && 'opacity-60',
                )}
              >
                Mention
              </span>
              {DISCORD_EVENT_OPTIONS.map((option) => {
                const sent = events.includes(option.value);

                return (
                  <TeamDiscordEventRow
                    key={option.value}
                    option={option}
                    description={describeEventOption(option, githubRepoName)}
                    sent={sent}
                    mentioned={sent && mentionEvents.includes(option.value)}
                    sendDisabled={Boolean(
                      option.requiresGithubRepo && !githubRepoName && !sent,
                    )}
                    mentionDisabled={mention === 'none' || !sent}
                    onSendChange={(checked) =>
                      handleSendChange(option.value, checked)
                    }
                    onMentionChange={(checked) =>
                      handleMentionChange(option.value, checked)
                    }
                  />
                );
              })}
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />

      {mentionsSomeone ? (
        <Alert variant="warning">
          <Alert.Description>
            The bot needs the “Mention @everyone, @here, and All Roles”
            permission in {channelName ? `#${channelName}` : 'this channel'}.
            Without it, Discord shows {mentionOption?.label} as plain text and
            nobody is notified.
          </Alert.Description>
        </Alert>
      ) : null}
    </>
  );
}
