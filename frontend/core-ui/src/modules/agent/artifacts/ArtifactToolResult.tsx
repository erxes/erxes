import type { IAgentToolStep } from '../utils/agentWorkSteps';
import { readArtifactResult } from './artifactResult';
import { ArtifactCard } from './ArtifactCard';

export const ArtifactToolResult = ({
  tool,
  isStreaming = false,
}: {
  tool: IAgentToolStep;
  isStreaming?: boolean;
}) => {
  if (tool.state === 'output-available') {
    const result = readArtifactResult(tool.output);
    return result ? (
      <ArtifactCard artifact={result.artifact} />
    ) : (
      <p role="alert" className="text-sm text-destructive">
        The generated file could not be displayed. Regenerate the response to
        try again.
      </p>
    );
  }
  if (tool.state === 'output-error' || tool.state === 'output-denied') {
    return (
      <p role="alert" className="text-sm text-destructive">
        File generation failed. Regenerate the response to try again.
      </p>
    );
  }
  if (!isStreaming) {
    return (
      <p role="alert" className="text-sm text-destructive">
        File generation stopped before completion. Regenerate the response to
        try again.
      </p>
    );
  }
  // The turn header owns progress while this tool is still producing a file.
  return null;
};
