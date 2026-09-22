import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';
import { KnowledgebaseArticleSelector } from './KnowledgebaseArticleSelector';

export const KnowledgebaseRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        aiKnowledgeSourceSelector: KnowledgebaseArticleSelector,
      }}
    />
  );
};
