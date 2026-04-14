export type TOpenAiCompatibleModel = {
  id: string;
};

export type TOpenAiCompatibleModelsResponse = {
  data?: TOpenAiCompatibleModel[];
};

export type TOpenAiCompatibleChatCompletionChoice = {
  finish_reason?: string | null;
  message?: {
    content?:
      | string
      | Array<{
          type?: string;
          text?: string | { value?: string };
          refusal?: string;
        }>;
    refusal?:
      | string
      | Array<{
          type?: string;
          text?: string | { value?: string };
          refusal?: string;
        }>;
  };
};

export type TOpenAiCompatibleChatCompletionResponse = {
  model?: string;
  choices?: TOpenAiCompatibleChatCompletionChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};
