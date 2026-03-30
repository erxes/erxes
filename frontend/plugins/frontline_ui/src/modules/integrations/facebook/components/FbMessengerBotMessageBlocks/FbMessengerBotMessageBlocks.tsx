import { TBotData } from '@/integrations/facebook/types/FacebookTypes';
import { cn } from 'erxes-ui';
import { FbMessengerBotButtonTemplateBlock } from './FbMessengerBotButtonTemplateBlock';
import { FbMessengerBotCarouselBlock } from './FbMessengerBotCarouselBlock';
import { FbMessengerBotFileBlock } from './FbMessengerBotFileBlock';
import { FbMessengerBotQuickRepliesBlock } from './FbMessengerBotQuickRepliesBlock';
import { FbMessengerBotTextBlock } from './FbMessengerBotTextBlock';

export const FbMessengerBotMessageBlocks = ({
  botData,
  className,
  internal,
  userId,
}: {
  botData?: TBotData[];
  className?: string;
  internal?: boolean;
  userId?: string;
}) => {
  if (!botData?.length) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {botData.map((item, index) => {
        if (item.type === 'text') {
          return (
            <FbMessengerBotTextBlock
              key={`text-${index}`}
              data={item}
              internal={internal}
            />
          );
        }

        if (item.type === 'button_template') {
          return (
            <FbMessengerBotButtonTemplateBlock
              key={`button-template-${index}`}
              data={item}
              internal={internal}
            />
          );
        }

        if (item.type === 'file') {
          return <FbMessengerBotFileBlock key={`file-${index}`} data={item} />;
        }

        if (item.type === 'quick_replies') {
          return (
            <FbMessengerBotQuickRepliesBlock
              key={`quick-replies-${index}`}
              data={item}
              internal={internal}
            />
          );
        }

        if (item.type === 'carousel') {
          return (
            <FbMessengerBotCarouselBlock key={`carousel-${index}`} data={item} />
          );
        }

        return null;
      })}
    </div>
  );
};
