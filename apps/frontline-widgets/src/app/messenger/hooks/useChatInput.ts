import { useState, FormEvent } from 'react';
import { useAtom } from 'jotai';
import {
  connectionAtom,
  conversationIdAtom,
  setActiveTabAtom,
} from '../states';
import { getLocalStorageItem, setLocalStorageItem } from '@libs/utils';
import { useInsertMessage } from './useInsertMessage';
import { IAttachment } from 'erxes-ui';

type SubmitOptions = {
  attachments?: IAttachment[];
  onClear?: () => void;
};

export function useChatInput() {
  const [conversationId, setConversationId] = useAtom(conversationIdAtom);
  const [connection, setConnection] = useAtom(connectionAtom);
  const { insertMessage, loading } = useInsertMessage();
  const [message, setMessage] = useState('');
  const [, setActiveTab] = useAtom(setActiveTabAtom);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  const { customerId } = connection.widgetsMessengerConnect;
  const __customerId = getLocalStorageItem('customerId');

  const handleSubmit = (e: FormEvent, options?: SubmitOptions) => {
    e.preventDefault();
    const { attachments = [], onClear } = options || {};
    if (!message.trim() && attachments.length === 0) return;

    insertMessage({
      variables: {
        contentType: 'text',
        message: message,
        customerId: customerId || __customerId || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
      onCompleted: (data) => {
        const _conversationId = data.widgetsInsertMessage.conversationId;
        const _customerId = data.widgetsInsertMessage.customerId;
        if (!conversationId) {
          setConversationId(_conversationId);
          setActiveTab('chat');
        }
        if (!customerId && !__customerId) {
          setLocalStorageItem('customerId', _customerId);
          setConnection((prev) => ({
            ...prev,
            widgetsMessengerConnect: {
              ...prev.widgetsMessengerConnect,
              customerId: _customerId,
            },
          }));
        }
        setMessage('');
        onClear?.();
      },
    });
  };

  const clearMessage = () => {
    setMessage('');
  };

  return {
    message,
    setMessage,
    handleInputChange,
    handleSubmit,
    clearMessage,
    isDisabled: !message.trim(),
    loading,
  };
}
