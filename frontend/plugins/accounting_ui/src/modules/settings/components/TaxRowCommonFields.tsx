import { Form, Input, Select } from 'erxes-ui';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export const TaxRowCommonFields = <T extends FieldValues>({
  control,
  kinds,
  kindLabels,
  statuses,
  statusLabels,
  statusColSpan = false,
}: {
  control: Control<T>;
  kinds: string[];
  kindLabels: Record<string, string>;
  statuses: string[];
  statusLabels: Record<string, string>;
  statusColSpan?: boolean;
}) => {
  return (
    <>
      <Form.Field
        control={control}
        name={'number' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Дугаар</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={'name' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Нэр</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={'kind' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Төрөл</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Төрөл сонгох" />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {kinds.map((kind) => (
                  <Select.Item key={kind} value={kind} className="capitalize">
                    {kindLabels[kind]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={'percent' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Хувь</Form.Label>
            <Form.Control>
              <Input
                type="number"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={0}
                max={100}
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={'status' as FieldPath<T>}
        render={({ field }) => (
          <Form.Item className={statusColSpan ? 'col-span-2' : undefined}>
            <Form.Label>Төлөв</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Төлөв сонгох" />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {statuses.map((status) => (
                  <Select.Item
                    key={status}
                    value={status}
                    className="capitalize"
                  >
                    {statusLabels[status]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
    </>
  );
};
