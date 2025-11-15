import { memo } from 'react';
import { Path } from 'react-hook-form';
import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { JSONTreeNode } from './JSONTreeNode';

interface JSONTreeEditorProps {
  name: Path<TOutgoingWebhookForm>;
  value: any;
}

export const JSONTreeEditor = memo(function JSONTreeEditor({
  name,
  value,
}: JSONTreeEditorProps) {
  return (
    <div className="space-y-2">
      <JSONTreeNode name={name} path={[name]} value={value} />
    </div>
  );
});
