import { TBotData } from '@/integrations/facebook/types/FacebookTypes';
import { readImage } from 'erxes-ui';

type TBotFileBlockData = Extract<TBotData, { type: 'file' }>;

export const FbMessengerBotFileBlock = ({
  data,
}: {
  data: TBotFileBlockData;
}) => {
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <img
        src={readImage(data.url)}
        alt="Bot media"
        className="max-h-[320px] w-full object-cover"
      />
    </div>
  );
};
