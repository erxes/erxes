import { Tooltip } from 'erxes-ui';
import { formatConversationCount } from '../utils/conversationDisplay';

export const ConversationCountValue = ({ count }: { count: number }) => (
  <Tooltip.Provider>
    <Tooltip>
      <Tooltip.Trigger asChild>
        <span className="tabular-nums" aria-label={count.toLocaleString('en')}>
          {formatConversationCount(count)}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>{count.toLocaleString('en')}</Tooltip.Content>
    </Tooltip>
  </Tooltip.Provider>
);
