import { useState, FormEvent } from 'react';
import { useAtom } from 'jotai';
import {
  connectionAtom,
  conversationIdAtom,
  setActiveTabAtom,
} from '../states';
import { getLocalStorageItem, setLocalStorageItem } from '@libs/utils';
import { useInsertMessage } from './useInsertMessage';

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      insertMessage({
        variables: {
          contentType: 'text',
          message: message,
          customerId: customerId || __customerId || undefined,
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
        },
      });
    }
  };

  const clearMessage = () => {
    setMessage('');
  };

  return {
    message,
    handleInputChange,
    handleSubmit,
    clearMessage,
    isDisabled: !message.trim(),
    loading,
  };
}
