import { Input } from 'erxes-ui';

const numberValue = (value: string) =>
  value === '' ? undefined : Number(value);

export const JobNumberInput = ({
  value,
  onChange,
  min,
  max,
  className,
}: {
  value?: number;
  onChange: (value?: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) => (
  <Input
    type="number"
    value={value ?? ''}
    min={min}
    max={max}
    className={className}
    onChange={(event) => onChange(numberValue(event.target.value))}
  />
);
