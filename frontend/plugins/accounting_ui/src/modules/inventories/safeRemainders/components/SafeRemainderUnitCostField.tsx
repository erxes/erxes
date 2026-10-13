import { INumberFieldContainerProps, NumberField } from 'erxes-ui';
import { useSafeRemainderItemEdit } from '../hooks/useSafeRemainderItemEdit';
import { ISafeRemainderItem } from '../types/SafeRemainder';

export const SafeRemainderUnitCostField = ({
  value,
  _id,
  remItem,
}: INumberFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();

  return (
    <NumberField
      value={value}
      scope={`remItem-${_id}-unit-cost`}
      onSave={(unitCost) =>
        editRemItem(
          {
            variables: {
              ...remItem,
              trInfo: {
                ...remItem.trInfo,
                unitCost: Math.max(0, unitCost),
                isCostExplicit: true,
              },
            },
          },
        )
      }
      className="bg-yellow-50 shadow-none rounded-none px-2 dark:bg-yellow-500/10"
    />
  );
};
