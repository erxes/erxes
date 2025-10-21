import { JSONTreeEditor } from '@/automations/components/builder/nodes/actions/webhooks/components/json/editor/JSONTreeEditor';
import { JSONRawEditor } from '@/automations/components/builder/nodes/actions/webhooks/components/json/editor/JSONRawEditor';
import { useJSONBodyBuilder } from '@/automations/components/builder/nodes/actions/webhooks/hooks/useJSONBodyBuilder';
import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { Path, useFormContext } from 'react-hook-form';

export function OutgoingWebhookBodyBuilder({
  name,
}: {
  name: Path<TOutgoingWebhookForm>;
}) {
  const { watch } = useFormContext<TOutgoingWebhookForm>();
  const value = watch(name);

  const { rawOpen, rawValue, onToggleRaw, onApplyRaw, onRawValueChange } =
    useJSONBodyBuilder(name, value);

  return (
    <div className="space-y-2">
      <JSONTreeEditor name={name} value={value} />
      <JSONRawEditor
        isOpen={rawOpen}
        value={rawValue}
        onToggle={onToggleRaw}
        onApply={onApplyRaw}
        onChange={onRawValueChange}
      />
    </div>
  );
}
