import {
  IconBrain,
  IconHeadset,
  IconPlayerPlay,
  IconRobot,
} from '@tabler/icons-react';
import { Badge, Button, readImage } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Message } from '../message';
import type { MessagePosition } from '../../types/message';
import { hasMessageContent } from '../../utils/quotedMessage';
import { connectionAtom, uiOptionsAtom } from '../../states';
import { getBotMessageParts } from '../../utils/botMessage';
import { TicketFormInline } from './ticket-form-inline';

const defaultLogo =
  'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)';

export const BotMessage = ({
  content,
  botData,
  createdAt,
  showAvatar = true,
  isFirstMessage,
  isLastMessage,
  isMiddleMessage,
  isSingleMessage,
  showOperatorToggle,
  operatorStatus,
  onToggleOperator,
  onQuickReply,
  onGetStarted,
  onTicketFormSubmit,
  onReply,
  onCopy,
}: {
  content?: string;
  botData?: unknown[];
  createdAt?: Date;
  showAvatar?: boolean;
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
  showOperatorToggle?: boolean;
  operatorStatus?: 'bot' | 'operator';
  onToggleOperator?: () => void;
  onQuickReply?: (title: string) => void;
  onGetStarted?: () => void;
  onTicketFormSubmit?: (payload: Record<string, string>) => void;
  onReply?: () => void;
  onCopy?: () => void | Promise<void>;
}) => {
  const connection = useAtomValue(connectionAtom);

  const { widgetsMessengerConnect } = connection || {};
  const { messengerData } = widgetsMessengerConnect || {};
  const { aiAgentLabel } = messengerData || {};

  const { hasTicketForm, hasTextItems, displayText, quickReplies } =
    getBotMessageParts(botData);

  const htmlContent = hasTextItems
    ? displayText
    : content
    ? `<p>${content}</p>`
    : '';

  if (createdAt) {
    const position: MessagePosition = {
      isFirstMessage,
      isLastMessage,
      isMiddleMessage,
      isSingleMessage,
    };
    const showTrailingSlots = isLastMessage || isSingleMessage;

    return (
      <Message align="start">
        <Message.Row className="group/message relative">
          <Message.Avatar show={showAvatar} className="mb-4">
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <IconBrain size={20} aria-hidden="true" />
            </div>
          </Message.Avatar>
          <Message.Body align="start">
            {(isFirstMessage || isSingleMessage) && (
              <Message.Author>
                {aiAgentLabel}{' '}
                <Badge
                  variant={'ghost'}
                  className="text-[10px] leading-none rounded-xl bg-primary/15 text-primary h-auto py-0.5"
                >
                  Auto
                </Badge>
              </Message.Author>
            )}
            {hasMessageContent(htmlContent) && (
              <Message.Content
                variant="bot"
                position={position}
                html={htmlContent}
              />
            )}
            {showTrailingSlots && (
              <Message.Time align="start" date={createdAt} />
            )}
          </Message.Body>
          <Message.ItemActions onReply={onReply} onCopy={onCopy} />
        </Message.Row>

        {showTrailingSlots &&
          (quickReplies.length > 0 || showOperatorToggle) && (
            <Message.Actions>
              {quickReplies.length > 0 &&
                onQuickReply &&
                quickReplies.map((qr, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onQuickReply(qr.title)}
                    className="h-7 text-xs gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    {qr.title}
                  </Button>
                ))}
              {showOperatorToggle && (
                // Message.Action == prompt-kit's MessageAction: control + tooltip.
                <Message.Action
                  label={
                    operatorStatus === 'operator'
                      ? 'Hand the conversation back to the bot'
                      : 'Ask for a human agent'
                  }
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onToggleOperator}
                    className="h-7 text-xs gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    {operatorStatus === 'operator' ? (
                      <>
                        <IconRobot size={13} aria-hidden="true" />
                        Talk to bot
                      </>
                    ) : (
                      <>
                        <IconHeadset size={13} aria-hidden="true" />
                        Talk to human
                      </>
                    )}
                  </Button>
                </Message.Action>
              )}
            </Message.Actions>
          )}

        {showTrailingSlots && hasTicketForm && onTicketFormSubmit && (
          <div className="pl-10 mt-1.5">
            <TicketFormInline onSubmit={onTicketFormSubmit} />
          </div>
        )}
      </Message>
    );
  }

  // Greeting variant: no timestamp, so no grouping and no tooltip.
  return (
    <div className="flex self-start items-start gap-2 my-2">
      <Message.Avatar show={showAvatar} className="place-self-end mb-2">
        <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <IconBrain size={20} aria-hidden="true" />
        </div>
      </Message.Avatar>
      <div className="flex flex-col gap-1">
        <Message.Author>
          {aiAgentLabel}{' '}
          <Badge
            variant={'ghost'}
            className="text-[10px] leading-none rounded-xl bg-primary/15 text-primary h-auto py-0.5"
          >
            Bot
          </Badge>
        </Message.Author>
        <Message.Content
          variant="incoming"
          position={{ isSingleMessage: true }}
          className="font-medium"
        >
          {content}
        </Message.Content>

        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {onGetStarted && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGetStarted}
              className="self-start h-7 text-xs gap-1.5 rounded-xl text-primary hover:bg-primary/10 hover:text-primary"
            >
              <IconPlayerPlay size={13} aria-hidden="true" />
              Get Started
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const WelcomeMessage = ({ content }: { content?: string }) => {
  const uiOptions = useAtomValue(uiOptionsAtom);
  return (
    <div className="flex items-end self-start gap-2 mb-2">
      {uiOptions?.logo && uiOptions?.logo?.length > 0 ? (
        <div className="bg-foreground/5 size-8 rounded flex items-center justify-center p-1">
          <img
            alt="logo"
            src={readImage(uiOptions?.logo)}
            className="object-center object-scale-down"
          />
        </div>
      ) : (
        <div
          className="size-8 rounded-full bg-size-[50%] bg-no-repeat bg-center bg-primary"
          style={{
            backgroundImage: defaultLogo,
          }}
        />
      )}
      <div className="flex flex-col max-w-3/4">
        {/* `shadow-2xs` overrides the variant's `shadow-sm` via tailwind-merge. */}
        <Message.Content
          variant="bot"
          position={{ isSingleMessage: true }}
          className="font-medium shadow-2xs"
        >
          {content}
        </Message.Content>
      </div>
    </div>
  );
};
