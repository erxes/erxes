import { useState } from 'react';
import { FieldErrors } from 'react-hook-form';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';

export type TAiAgentConfigTab = 'setup' | 'output' | 'memory';
export type TAiAgentOutputTab = 'fields' | 'tools';

const OUTPUT_ITEM_KEYS = ['captureFields', 'objectFields', 'topics'];

/**
 * Active tab and output section. A failed save jumps to the first section
 * holding an error, since an inactive tab's fields are not mounted to show it.
 */
export const useAiAgentConfigTabs = () => {
  const [tab, setTab] = useState<TAiAgentConfigTab>('setup');
  const [outputTab, setOutputTab] = useState<TAiAgentOutputTab>('fields');

  // Follows the tab order: setup errors come before output and memory ones.
  const showFirstError = (errors: FieldErrors<TAiAgentConfigForm>) => {
    const keys = Object.keys(errors);
    const nonSetupKeys = [...OUTPUT_ITEM_KEYS, 'tools', 'memory'];

    if (keys.some((key) => !nonSetupKeys.includes(key))) {
      setTab('setup');
      return;
    }

    if (keys.some((key) => OUTPUT_ITEM_KEYS.includes(key))) {
      setTab('output');
      setOutputTab('fields');
      return;
    }

    if (keys.includes('tools')) {
      setTab('output');
      setOutputTab('tools');
      return;
    }

    if (keys.includes('memory')) {
      setTab('memory');
    }
  };

  return { tab, setTab, outputTab, setOutputTab, showFirstError };
};
