import { TActivityLog } from '../types';
import { ActivityLogActorName } from './ActivityLogActor';
import { usePropertiesFieldChangeSentence } from '../hooks/usePropertiesFieldChangeSentence';
import { PropertiesFieldChangeSentencePart } from './PropertiesFieldChangeSentencePart';
import { PropertyChangeItemsList } from './PropertyChangeItemsList';
import {
  useMultiSelectComputation,
  isMultiSelectOrCheckboxField,
} from '../hooks/usePropertyFieldChange';

interface PropertiesFieldChangeSentenceProps {
  activity: TActivityLog;
}

export const PropertiesFieldChangeSentence = ({
  activity,
}: PropertiesFieldChangeSentenceProps) => {
  const {
    fieldLabel,
    fieldType,
    fieldOptions,
    previousValue,
    currentValue,
    actionType,
    added,
    removed,
  } = usePropertiesFieldChangeSentence(activity);

  const isMultiSelect = isMultiSelectOrCheckboxField(fieldType);
  const { finalAdded = [], finalRemoved = [] } = useMultiSelectComputation({
    isMultiSelect,
    added,
    removed,
    previousValue,
    currentValue,
  });

  // Handle multiselect/checkbox fields with added/removed items
  if (isMultiSelect && (finalAdded?.length > 0 || finalRemoved?.length > 0)) {
    return (
      <>
        <ActivityLogActorName activity={activity} />
        <span className="text-muted-foreground">changed</span>
        <span className="font-medium">{fieldLabel}</span>
        {finalRemoved && finalRemoved.length > 0 ? (
          <PropertyChangeItemsList
            label="removed"
            items={finalRemoved}
            fieldType={fieldType}
            options={fieldOptions}
          />
        ) : null}
        {finalAdded && finalAdded.length > 0 ? (
          <PropertyChangeItemsList
            label="added"
            items={finalAdded}
            fieldType={fieldType}
            options={fieldOptions}
          />
        ) : null}
      </>
    );
  }

  // Handle regular (non-multiselect/checkbox) fields with prev/current values
  if (actionType === 'set' && currentValue !== undefined) {
    return (
      <>
        <ActivityLogActorName activity={activity} />
        <span className="text-muted-foreground">set</span>
        <span className="font-medium">{fieldLabel}</span>
        <PropertiesFieldChangeSentencePart
          name="to"
          props={{ value: currentValue, fieldType, options: fieldOptions }}
        />
      </>
    );
  }

  if (actionType === 'unset' && previousValue !== undefined) {
    return (
      <>
        <ActivityLogActorName activity={activity} />
        <span className="text-muted-foreground">cleared</span>
        <span className="font-medium">{fieldLabel}</span>
        <PropertiesFieldChangeSentencePart
          name="from"
          props={{ value: previousValue, fieldType, options: fieldOptions }}
        />
      </>
    );
  }

  return (
    <>
      <ActivityLogActorName activity={activity} />
      <span className="text-muted-foreground">changed</span>
      <span className="font-medium">{fieldLabel}</span>
      {previousValue !== undefined ? (
        <PropertiesFieldChangeSentencePart
          name="from"
          props={{ value: previousValue, fieldType, options: fieldOptions }}
        />
      ) : null}
      {currentValue !== undefined ? (
        <PropertiesFieldChangeSentencePart
          name="to"
          props={{ value: currentValue, fieldType, options: fieldOptions }}
        />
      ) : null}
    </>
  );
};
