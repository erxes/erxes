import { Switch, useFilterContext } from 'erxes-ui';
import { parseAsBoolean, useQueryState } from 'nuqs';

/** "Is active" in the filter popover: on lists invited and active members, off the deactivated ones. */
export const IsActiveBar = () => {
  const [isActive, setIsActive] = useQueryState('isActive', parseAsBoolean);
  const { resetFilterState } = useFilterContext();

  const currentValue = isActive ?? true;

  const handleToggle = () => {
    // Default (on) stays out of the URL.
    void setIsActive(currentValue ? false : null);
    resetFilterState();
  };

  return (
    <div className="flex items-center justify-center ml-auto">
      <Switch checked={currentValue} onCheckedChange={handleToggle} />
    </div>
  );
};
