import { Control, FieldPathByValue } from 'react-hook-form';
import { Form, Input, Editor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('tourism');
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('name')}<span className="text-primary">{labelSuffix}</span>{' '}
            <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input placeholder={t('element-name')} {...field} />
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
  const { t } = useTranslation('tourism');
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('note')}<span className="text-primary">{labelSuffix}</span>
          </Form.Label>
          <Form.Description>
            {t('not-visible-for-clients')}
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
  const { t } = useTranslation('tourism');
  return (
    <Form.Field
      control={control}
      name="startTime"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('start-time')}</Form.Label>
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
  const { t } = useTranslation('tourism');
  return (
    <Form.Field
      control={control}
      name="duration"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('duration-minutes')}</Form.Label>
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
  const { t } = useTranslation('tourism');
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('cost')}</Form.Label>
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
