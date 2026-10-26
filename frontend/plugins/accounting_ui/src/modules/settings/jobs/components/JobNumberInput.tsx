import { Input } from 'erxes-ui';

const numberValue = (value: string) =>
  value === '' ? undefined : Number(value);

export const JobNumberInput = ({
  value,
  onChange,
  min,
  max,
}: {
  value?: number;
  onChange: (value?: number) => void;
  min?: number;
  max?: number;
}) => (
  <Input
    type="number"
    value={value ?? ''}
    min={min}
    max={max}
    onChange={(event) => onChange(numberValue(event.target.value))}
  />
);
