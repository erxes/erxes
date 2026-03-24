export type TAiAgentTrainingStatus = {
  agentId: string;
  totalFiles: number;
  processedFiles: number;
  status: string;
  error: string;
};

export type TAiAgentTrainingStatusQueryResponse = {
  getTrainingStatus: TAiAgentTrainingStatus;
};
