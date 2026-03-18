import { useState, FormEvent, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { useMutation } from '@apollo/client';
import {
  connectionAtom,
  conversationIdAtom,
  messengerTabAtom,
} from '../states';
import { getLocalStorageItem, setLocalStorageItem } from '@libs/utils';
import { useInsertMessage } from './useInsertMessage';
import { WIDGETS_SEND_TYPING_INFO } from '../graphql/mutations';
import { TYPING_STOP_TIMEOUT_MS } from '../constants';

export function useChatInput() {
  const [conversationId, setConversationId] = useAtom(conversationIdAtom);
  const [connection, setConnection] = useAtom(connectionAtom);
  const { insertMessage, loading } = useInsertMessage();
  const [message, setMessage] = useState('');
  const [, setActiveTab] = useAtom(messengerTabAtom);
  const { customerId } = connection.widgetsMessengerConnect;
  const __customerId = getLocalStorageItem('customerId');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sendTypingInfo] = useMutation(WIDGETS_SEND_TYPING_INFO);

  const sendStopTyping = useCallback(
    (cId: string) => {
      sendTypingInfo({ variables: { conversationId: cId, text: '' } }).catch(
        () => {},
      );
    },
    [sendTypingInfo],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!conversationId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (value.trim()) {
      sendTypingInfo({
        variables: { conversationId, text: value },
      }).catch(() => {});

      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping(conversationId);
      }, TYPING_STOP_TIMEOUT_MS);
    } else {
      sendStopTyping(conversationId);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (conversationId) sendStopTyping(conversationId);

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
