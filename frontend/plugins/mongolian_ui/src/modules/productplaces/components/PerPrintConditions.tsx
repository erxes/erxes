import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments } from 'ui-modules';

import { Condition } from '../types';

type PrintCondition = Condition & {
  branchId?: string;
  departmentId?: string;
};

type Props = {
  condition: PrintCondition;
  onChange: (id: string, condition: PrintCondition) => void;
  onRemove: (id: string) => void;
  onAddCondition?: () => void;
};

const PerPrintConditions = ({
  condition,
  onChange,
  onRemove,
  onAddCondition,
}: Props) => {
  const { t } = useTranslation('mongolian');
  const onChangeConfig = (key: string, value: string) => {
    onChange(condition.id, { ...condition, [key]: value });
  };

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 grid grid-cols-2 gap-3">
        <div>
          <SelectBranches.Root
            value={condition.branchId || ''}
            onValueChange={(branchId) =>
              onChangeConfig(
                'branchId',
                typeof branchId === 'string' ? branchId : '',
              )
            }
          />
        </div>
        <div>
          <SelectDepartments.Root
            value={condition.departmentId || ''}
            onValueChange={(departmentId) =>
              onChangeConfig(
                'departmentId',
                typeof departmentId === 'string' ? departmentId : '',
              )
            }
          />
        </div>
      </div>
      <div className="flex gap-2 h-8">
        <Button
          type="button"
          className="h-8"
          variant="outline"
          size="sm"
          onClick={() => onRemove(condition.id)}
        >
          ✕ {t('delete-condition')}
        </Button>
        {onAddCondition && (
          <Button
            type="button"
            className="h-8"
            variant="outline"
            size="sm"
            onClick={onAddCondition}
          >
            + {t('add-condition')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PerPrintConditions;
