import { GENERATE_AGENT_MESSAGE } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';

export const useAiAgentTestChat = (agentId?: string) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<
    Array<{ question: string; answer: string; timestamp: Date }>
  >([]);

  const [generateMessage] = useMutation(GENERATE_AGENT_MESSAGE, {
    onCompleted: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          question,
          answer: data.generateAgentMessage.message,
          timestamp: new Date(),
        },
      ]);
      setQuestion('');
      setIsGenerating(false);
    },
    onError: ({ message }) => {
      toast({
        title: 'Failed to generate message',
        description: message,
      });
      setIsGenerating(false);
    },
  });

  const handleAskQuestion = async () => {
    if (!agentId || !question.trim()) return;

    try {
      setIsGenerating(true);
      await generateMessage({
        variables: {
          agentId: agentId,
          question: question.trim(),
        },
      });
    } catch (error) {
      console.error('Failed to ask question:', error);
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    messages,
    handleAskQuestion,
    question,
    setQuestion,
  };
};
