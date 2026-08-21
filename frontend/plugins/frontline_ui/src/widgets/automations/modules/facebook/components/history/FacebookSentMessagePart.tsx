import { Badge } from 'erxes-ui';
import { TFacebookSentPart } from '~/widgets/automations/modules/facebook/components/history/types';

const PART_LABEL: Record<TFacebookSentPart['type'], string> = {
  text: 'Text',
  button_template: 'Buttons',
  quick_replies: 'Quick replies',
  carousel: 'Card',
  file: 'File',
};

export const getSentPartLabel = (part?: TFacebookSentPart) =>
  part ? PART_LABEL[part.type] : 'Message';

const SentText = ({ html }: { html?: string }) =>
  html ? (
    <div
      className="prose prose-sm max-w-none break-words text-xs [&_*]:max-w-full [&_p]:my-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : null;

const SentChoices = ({ titles }: { titles: string[] }) =>
  titles.length ? (
    <div className="flex flex-wrap gap-1">
      {titles.map((title, index) => (
        <Badge key={`${title}-${index}`} variant="secondary">
          {title}
        </Badge>
      ))}
    </div>
  ) : null;

export const FacebookSentMessagePart = ({
  part,
}: {
  part: TFacebookSentPart;
}) => {
  if (part.type === 'text') {
    return <SentText html={part.text} />;
  }

  if (part.type === 'button_template') {
    return (
      <>
        <SentText html={part.text} />
        <SentChoices titles={part.buttons.map(({ title }) => title)} />
      </>
    );
  }

  if (part.type === 'quick_replies') {
    return (
      <>
        <SentText html={part.text} />
        <SentChoices titles={part.quick_replies.map(({ title }) => title)} />
      </>
    );
  }

  if (part.type === 'carousel') {
    return (
      <div className="space-y-2">
        {part.elements.map((element, index) => (
          <div
            key={`${element.title}-${index}`}
            className="space-y-1 rounded border bg-background p-2"
          >
            <p className="text-xs font-medium">{element.title}</p>
            {element.subtitle && (
              <p className="text-xs text-muted-foreground">
                {element.subtitle}
              </p>
            )}
            <SentChoices titles={element.buttons.map(({ title }) => title)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <a
      href={part.url}
      target="_blank"
      rel="noreferrer"
      className="break-all text-xs text-primary underline"
    >
      {part.url}
    </a>
  );
};
