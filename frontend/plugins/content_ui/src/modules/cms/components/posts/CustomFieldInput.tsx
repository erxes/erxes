import {
  Input,
  Textarea,
  Select,
  MultipleSelector,
  Switch,
  DatePicker,
} from 'erxes-ui';

interface CustomFieldInputProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
}

export const CustomFieldInput = ({
  field,
  value,
  onChange,
}: CustomFieldInputProps) => {
  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type === 'text' ? 'text' : field.type}
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            rows={3}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        );

      case 'date':
        return (
          <DatePicker
            value={value ? new Date(value) : undefined}
            onChange={(date) =>
              onChange(date ? (date as Date).toISOString() : '')
            }
            placeholder={field.placeholder || 'Select date'}
          />
        );

      case 'checkbox':
      case 'boolean':
        return (
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
          />
        );

      case 'select':
        if (!field.options?.length) return null;
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <Select.Trigger className="w-full">
              <Select.Value
                placeholder={
                  field.placeholder || `Select ${field.label.toLowerCase()}`
                }
              />
            </Select.Trigger>
            <Select.Content>
              {field.options.map((option: string, idx: number) => (
                <Select.Item key={idx} value={option}>
                  {option}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        );

      case 'radio':
        if (!field.options?.length) return null;
        return (
          <div className="flex flex-col gap-2">
            {field.options.map((option: string, idx: number) => (
              <label
                key={idx}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  name={field._id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4 text-primary border-input focus:ring-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiSelect':
        if (!field.options?.length) return null;
        const selectedValues = Array.isArray(value) ? value : [];
        const multiOptions = field.options.map((opt: string) => ({
          label: opt,
          value: opt,
        }));
        return (
          <MultipleSelector
            value={multiOptions.filter((o: any) =>
              selectedValues.includes(o.value),
            )}
            options={multiOptions}
            placeholder={
              field.placeholder || `Select ${field.label.toLowerCase()}`
            }
            hidePlaceholderWhenSelected
            emptyIndicator="No options"
            onChange={(opts: any[]) => onChange(opts.map((o) => o.value))}
          />
        );

      default:
        return (
          <Input
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        );
    }
  };

  return renderInput();
};
