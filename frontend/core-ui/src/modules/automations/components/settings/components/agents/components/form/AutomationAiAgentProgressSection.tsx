import { useAiAgentTrainingProcess } from '@/automations/components/settings/components/agents/hooks/useAiAgentTrainingProcess';
import { TAiAgentTrainingStatus } from '@/automations/components/settings/components/agents/types/automationAiAgentForm';
import { Button, cn } from 'erxes-ui';

export const AutomationAiAgentProgressSection = ({
  agentId,
  trainingStatus,
}: {
  agentId: string;
  trainingStatus?: TAiAgentTrainingStatus;
}) => {
  const { isFilesExists, isStartedTraining, handleStartTraining } =
    useAiAgentTrainingProcess(agentId);

  const {
    processedFiles = 0,
    totalFiles = 0,
    status,
    error,
  } = trainingStatus || {};

  const buttonLabel = (() => {
    if (isStartedTraining) return 'Training in Progress...';
    if (status === 'failed') return 'Retry Training';
    if (processedFiles > totalFiles) return 'Resume Training';
    if (totalFiles > 0 && totalFiles === processedFiles) return 'Re-train AI';
    return 'Start AI Training';
  })();
  return (
    <div className="mb-6 p-4 border rounded-lg ">
      <h3 className="text-lg font-semibold mb-4">AI Training Status</h3>

      {trainingStatus && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Files Processed:</span>
            <span className="font-medium">
              {processedFiles} / {totalFiles}
            </span>
          </div>

          <div className="w-full  rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  totalFiles > 0 ? (processedFiles / totalFiles) * 100 : 0
                }%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between text-sm">
            <span>Status:</span>
            <span
              className={cn(`font-medium 'text-accent-foreground'`, {
                'text-destructive': status === 'failed',
                'text-success': status === 'completed',
                'text-blue-600': status === 'processing',
              })}
            >
              {status}
            </span>
          </div>

          {error && (
            <div className="text-destructive text-sm">Error: {error}</div>
          )}
        </div>
      )}

      <div className="mt-4">
        <Button
          onClick={handleStartTraining}
          // disabled={isStartedTraining || !isFilesExists}
          className="w-full"
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
