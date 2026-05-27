import { Control, FieldPathByValue } from 'react-hook-form';
import { Form, Input, Editor } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { ElementCreateFormType } from '../constants/formSchema';
import { LANGUAGES } from '@/tms/constants/languages';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

type ElementTextFieldPath = FieldPathByValue<
  ElementCreateFormType,
  string | undefined
>;

type ElementNumberFieldPath = FieldPathByValue<
  ElementCreateFormType,
  number | undefined
>;

interface ElementNameFieldProps {
  control: Control<ElementCreateFormType>;
  name?: ElementTextFieldPath;
  labelSuffix?: string;
}

interface ElementNoteFieldProps {
  control: Control<ElementCreateFormType>;
  name?: ElementTextFieldPath;
  labelSuffix?: string;
}

export const ElementNameField = ({
  control,
  name = 'name',
  labelSuffix = '',
}: ElementNameFieldProps) => {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Name<span className="text-primary">{labelSuffix}</span>{' '}
            <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input placeholder="Element name" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ElementNoteField = ({
  control,
  name = 'note',
  labelSuffix = '',
}: ElementNoteFieldProps) => {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Note<span className="text-primary">{labelSuffix}</span>
          </Form.Label>
          <Form.Description>
            Not visible for clients and agents.
          </Form.Description>
          <Form.Control>
            <Editor
              key={name}
              initialContent={field.value}
              onChange={field.onChange}
              isHTML
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ElementStartTimeField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="startTime"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Start Time</Form.Label>
          <Form.Control>
            <Input type="time" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ElementDurationField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="duration"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Duration (minutes)</Form.Label>
          <Form.Control>
            <Input type="number" placeholder="0" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ElementCostField = ({
  control,
  name = 'cost',
  currencySymbol,
}: {
  control: Control<ElementCreateFormType>;
  name?: ElementNumberFieldPath;
  currencySymbol?: string;
}) => {
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Cost</Form.Label>
          <Form.Control>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {symbol}
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...field}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
