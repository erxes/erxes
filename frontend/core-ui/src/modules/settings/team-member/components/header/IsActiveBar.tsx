import { Filter, Switch, useFilterContext, useQueryState } from 'erxes-ui';

export const IsActiveBar = () => {
  const [isActive, setIsActive] = useQueryState<boolean>('isActive');
  const { resetFilterState } = useFilterContext();

  const currentValue = isActive ?? true;

  const handleToggle = (value: boolean) => {
    const nextValue = !currentValue;
    setIsActive(nextValue);
    resetFilterState();
  };
  return (
    <div className="flex items-center justify-center ml-auto">
      <Switch checked={currentValue} onCheckedChange={handleToggle} />
    </div>
  );
};
