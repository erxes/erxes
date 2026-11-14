import { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';

export interface ISettingsPanelScope {
  channelId?: string;
  pipelineId?: string;
}

export const SettingsPanelContext = createContext<ISettingsPanelScope | null>(
  null,
);

/** Reads panel scope when present, otherwise falling back to route params. */
export const useSettingsParams = (): {
  id: string | undefined;
  pipelineId: string | undefined;
} => {
  const scope = useContext(SettingsPanelContext);
  const params = useParams<{ id: string; pipelineId: string }>();

  return {
    id: scope === null ? params.id : scope.channelId,
    pipelineId: scope === null ? params.pipelineId : scope.pipelineId,
  };
};
