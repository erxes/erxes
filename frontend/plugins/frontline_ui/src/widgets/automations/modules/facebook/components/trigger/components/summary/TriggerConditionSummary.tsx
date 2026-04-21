import { TTriggerConditionSummaryItem } from '../../types/triggerSummary';

export const TriggerConditionSummary = ({
  conditionSummaries,
}: {
  conditionSummaries: TTriggerConditionSummaryItem[];
}) => {
  return (
    <>
      {conditionSummaries.map((condition, index) => (
        <div key={condition._id}>
          <div>
            <p className="text-sm font-semibold">{condition.label}</p>
            <span className="text-accent-foreground">
              {condition.description}
              {condition.value ? (
                <span className="text-primary">{` ${condition.value}`}</span>
              ) : null}
            </span>
          </div>

          {conditionSummaries.length > 1 &&
          index + 1 !== conditionSummaries.length ? (
            <span className="flex justify-center">OR</span>
          ) : null}
        </div>
      ))}
    </>
  );
};
