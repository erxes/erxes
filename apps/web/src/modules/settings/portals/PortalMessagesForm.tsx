import { DEFAULT_CODE_MESSAGES, type Portal } from '@erxes/core-contract';
import { Button, Form, Input, LANGUAGES, Select, Spinner, Textarea } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FromAddressPicker } from '~/components/FromAddressPicker';
import { ReplyToSelect } from '~/components/ReplyToSelect';
import { useFromAddress } from '~/components/useFromAddress';
import { useSavePortal } from './useSavePortal';

type Messages = Pick<
  Portal,
  'fromEmail' | 'replyTo' | 'codeLanguage' | 'codeEmailSubject' | 'codeEmailBody' | 'codeSmsText'
>;

type Texts = Record<'codeEmailSubject' | 'codeEmailBody' | 'codeSmsText', string>;

/** The portal's own words, or null to send the default. */
const ownOrNull = (text: string) => text.trim() || null;

/** One message field: empty shows and sends the default in the portal's language. */
const MessageField = ({
  label,
  value,
  placeholder,
  multiline,
  maxLength,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  maxLength: number;
  disabled: boolean;
  onChange: (value: string) => void;
}) => {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {multiline ? (
        <Textarea
          id={id}
          rows={5}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          id={id}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
};

/** The code email and text in the portal's words, each empty for the default in its language. */
const CodeMessages = ({
  language,
  texts,
  disabled,
  onLanguage,
  onText,
}: {
  language: Messages['codeLanguage'];
  texts: Texts;
  disabled: boolean;
  onLanguage: (language: Messages['codeLanguage']) => void;
  onText: (field: keyof Texts, value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const defaults = DEFAULT_CODE_MESSAGES[language];

  return (
    <Form.Section
      title={t('code-messages', 'Code messages')}
      description={t(
        'code-messages-description',
        'What the sign-in code email and text say. {code}, {minutes} and {portal} are filled in, and each must say {code}. Empty: the default in its language.',
      )}
    >
      <div className="space-y-3">
        <Select
          value={language}
          disabled={disabled}
          onValueChange={(next) =>
            onLanguage(LANGUAGES.find(({ code }) => code === next)?.code ?? 'en')
          }
        >
          <Select.Trigger aria-label={t('code-language', 'Default language')}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {LANGUAGES.map(({ code, label }) => (
              <Select.Item key={code} value={code}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <MessageField
          label={t('code-email-subject', 'Email subject')}
          value={texts.codeEmailSubject}
          placeholder={defaults.emailSubject}
          maxLength={200}
          disabled={disabled}
          onChange={(value) => onText('codeEmailSubject', value)}
        />
        <MessageField
          label={t('code-email-body', 'Email text')}
          value={texts.codeEmailBody}
          placeholder={defaults.emailBody}
          maxLength={2000}
          multiline
          disabled={disabled}
          onChange={(value) => onText('codeEmailBody', value)}
        />
        <MessageField
          label={t('code-sms-text', 'Text message')}
          value={texts.codeSmsText}
          placeholder={defaults.sms}
          maxLength={300}
          disabled={disabled}
          onChange={(value) => onText('codeSmsText', value)}
        />
      </div>
    </Form.Section>
  );
};

/** Where the portal's emails come from (a verified domain's address) and where replies go. */
const Sender = ({
  fromEmail,
  replyTo,
  disabled,
  onFrom,
  onReplyTo,
}: {
  fromEmail: string | null;
  replyTo: string | null;
  disabled: boolean;
  onFrom: (fromEmail: string | null) => void;
  onReplyTo: (replyTo: string | null) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const fromId = useId();
  const replyToId = useId();
  const from = useFromAddress(fromEmail, onFrom);

  return (
    <>
      {from.shown && (
        <Form.Section
          title={t('from-email', 'From address')}
          description={t(
            'from-email-description',
            'Its code and notification emails come from this address, on a domain your email provider verified. Empty: the organisation’s own address.',
          )}
        >
          <FromAddressPicker id={fromId} from={from} disabled={disabled} />
        </Form.Section>
      )}
      <Form.Section
        title={t('reply-to', 'Reply-To')}
        description={t(
          'reply-to-description',
          'Replies to its code and notification emails go here. None: to the sender.',
        )}
      >
        <ReplyToSelect id={replyToId} value={replyTo} disabled={disabled} onChange={onReplyTo} />
      </Form.Section>
    </>
  );
};

/**
 * What the portal's sign-in codes say by email and text, in which language by default, and
 * where its emails come from and replies go.
 */
export const PortalMessagesForm = ({ portal, canEdit }: { portal: Portal; canEdit: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const save = useSavePortal();
  const [fromEmail, setFromEmail] = useState(() => portal.fromEmail);
  const [replyTo, setReplyTo] = useState(() => portal.replyTo);
  const [language, setLanguage] = useState<Messages['codeLanguage']>(() => portal.codeLanguage);

  const [texts, setTexts] = useState<Texts>(() => ({
    codeEmailSubject: portal.codeEmailSubject ?? '',
    codeEmailBody: portal.codeEmailBody ?? '',
    codeSmsText: portal.codeSmsText ?? '',
  }));

  const disabled = !canEdit;

  return (
    <div className="space-y-4">
      <Sender
        fromEmail={fromEmail}
        replyTo={replyTo}
        disabled={disabled}
        onFrom={setFromEmail}
        onReplyTo={setReplyTo}
      />
      <CodeMessages
        language={language}
        texts={texts}
        disabled={disabled}
        onLanguage={setLanguage}
        onText={(field, value) => setTexts({ ...texts, [field]: value })}
      />
      {canEdit && (
        <div className="flex justify-end">
          <Button
            disabled={save.isPending}
            onClick={() =>
              save.mutate({
                id: portal.id,
                fromEmail,
                replyTo,
                codeLanguage: language,
                codeEmailSubject: ownOrNull(texts.codeEmailSubject),
                codeEmailBody: ownOrNull(texts.codeEmailBody),
                codeSmsText: ownOrNull(texts.codeSmsText),
              })
            }
          >
            {save.isPending && <Spinner size="sm" />}
            {t('save', 'Save')}
          </Button>
        </div>
      )}
    </div>
  );
};
