import { useAiAgentTestChat } from '@/automations/components/settings/components/agents/hooks/useAiAgentTestChat';
import { Button, Input } from 'erxes-ui';

export const AutomationAiAgentTestChatSection = ({
  trainingStatus,
  agentId,
}: {
  trainingStatus?: string;
  agentId?: string;
}) => {
  if (trainingStatus !== 'completed') {
    return null;
  }

  const { isGenerating, messages, handleAskQuestion, question, setQuestion } =
    useAiAgentTestChat(agentId);

  return (
    <div className="mb-6 p-4 border rounded-lg bg-background flex-1 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Ask Your AI Agent</h3>

      {/* Chat Messages */}
      <div className="mb-4 max-h-64 overflow-y-auto space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className="space-y-2">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">You:</div>
              <div>{msg.question}</div>
            </div>
            <div className="bg-background p-3 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">AI Agent:</div>
              <div>{msg.answer}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Question Input */}
      <div className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your uploaded files..."
          onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
          disabled={isGenerating}
          className="flex-1"
        />
        <Button
          onClick={handleAskQuestion}
          disabled={isGenerating || !question.trim()}
        >
          {isGenerating ? 'Generating...' : 'Ask'}
        </Button>
      </div>
    </div>
  );
};
