import { useQueryState } from 'erxes-ui';
import { createContext, ReactNode, useContext } from 'react';
import { useBroadcastMessage } from '../hooks/useBroadcastMessage';

type TBroadcastDetailContext = ReturnType<typeof useBroadcastMessage> & {
  messageId: string;
};

const BroadcastDetailContext = createContext<TBroadcastDetailContext | null>(
  null,
);

export const useBroadcastDetail = () => {
  const context = useContext(BroadcastDetailContext);

  if (!context) {
    throw new Error(
      'useBroadcastDetail must be used within a BroadcastDetailProvider',
    );
  }

  return context;
};

/**
 * The open campaign, read once for the whole sheet. The header, the body and
 * every tab each used to ask for it on their own.
 */
export const BroadcastDetailProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [messageId] = useQueryState<string>('messageId');
  const detail = useBroadcastMessage({
    variables: { _id: messageId },
    skip: !messageId,
  });

  if (!messageId) {
    return null;
  }

  return (
    <BroadcastDetailContext.Provider value={{ ...detail, messageId }}>
      {children}
    </BroadcastDetailContext.Provider>
  );
};
