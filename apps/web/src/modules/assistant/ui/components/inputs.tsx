import { createComponentImplementation } from '@erxes/assistant-catalog/react';
import {
  ButtonApi,
  CheckBoxApi,
  DateTimeInputApi,
  MemberPickerApi,
  TextFieldApi,
} from '@erxes/assistant-catalog';
import { memberQueries } from '@erxes/core-contract/client';
import {
  Button as UiButton,
  Checkbox,
  cn,
  DateInput,
  DatePicker,
  Input,
  Label,
  LookupPicker,
  Textarea,
  TimeField,
  toIsoDay,
  useMemberOptions,
} from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useUiHost } from '../host';
import { Weighted, weighted } from './children';
import { Field, Problems } from './field';
import { listOf, optionalText, pickedEntry, pickedRecord, textOf } from './values';

const BUTTON_VARIANTS = { default: 'outline', primary: 'default', borderless: 'ghost' } as const;

export const Button = createComponentImplementation(ButtonApi, ({ props, buildChild }) => {
  const host = useUiHost();

  return (
    <Weighted weight={props.weight}>
      <UiButton
        className="self-start"
        variant={BUTTON_VARIANTS[props.variant ?? 'default']}
        size="sm"
        disabled={!host.live || props.isValid === false}
        onClick={(event) => {
          host.press(event.currentTarget.textContent.trim());
          void props.action();
        }}
      >
        {buildChild(props.child)}
      </UiButton>
    </Weighted>
  );
});

export const TextField = createComponentImplementation(TextFieldApi, ({ props }) => {
  const id = useId();
  const host = useUiHost();
  const value = textOf(props.value);

  const shared = {
    id,
    value,
    disabled: !host.live,
    placeholder: optionalText(props.placeholder),
    'aria-invalid': props.isValid === false,
    'aria-describedby': `${id}-problems`,
  };

  return (
    <Field label={optionalText(props.label)} htmlFor={id} weight={props.weight}>
      {props.variant === 'longText' ? (
        <Textarea {...shared} rows={3} onChange={(event) => props.setValue(event.target.value)} />
      ) : (
        <Input
          {...shared}
          type={
            { number: 'number', obscured: 'password', shortText: 'text' }[
              props.variant ?? 'shortText'
            ]
          }
          onChange={(event) => props.setValue(event.target.value)}
        />
      )}
      <Problems id={`${id}-problems`} messages={props.validationErrors} />
    </Field>
  );
});

export const CheckBox = createComponentImplementation(CheckBoxApi, ({ props }) => {
  const id = useId();
  const host = useUiHost();

  return (
    <div
      style={{ '--weight': props.weight }}
      className={cn('flex min-w-0 items-center gap-2', weighted(props.weight))}
    >
      <Checkbox
        id={id}
        checked={props.value === true}
        disabled={!host.live}
        onCheckedChange={(checked) => props.setValue(checked)}
      />
      <Label htmlFor={id} variant="plain">
        {textOf(props.label)}
      </Label>
    </div>
  );
});

const dayOf = (value: string) => value.slice(0, 10);

const dateOf = (value: unknown) => {
  const text = textOf(value);

  return text ? new Date(text) : undefined;
};

const timeOf = (value: string) => (value.includes('T') ? value.slice(11, 16) : '');

export const DateTimeInput = createComponentImplementation(DateTimeInputApi, ({ props }) => {
  const id = useId();
  const host = useUiHost();
  const { t } = useTranslation('assistant');
  const value = textOf(props.value);
  const withDate = props.enableDate !== false;
  const withTime = props.enableTime === true;

  const setDay = (day: string) =>
    props.setValue(withTime && day ? `${day}T${timeOf(value) || '00:00'}` : day);

  return (
    <Field label={optionalText(props.label)} htmlFor={id} weight={props.weight}>
      <div className="flex flex-wrap gap-2">
        {withDate && !withTime && (
          <DatePicker
            id={id}
            value={value || undefined}
            minDate={dateOf(props.min)}
            maxDate={dateOf(props.max)}
            placeholder={t('ui.date-placeholder', 'Choose a date')}
            disabled={!host.live}
            onChange={(date) => setDay(date instanceof Date ? toIsoDay(date) : '')}
          />
        )}
        {withDate && withTime && (
          <DateInput
            id={id}
            value={dayOf(value)}
            min={optionalText(props.min)?.slice(0, 10)}
            max={optionalText(props.max)?.slice(0, 10)}
            disabled={!host.live}
            onChange={(event) => setDay(event.target.value)}
          />
        )}
        {withTime && (
          <TimeField
            id={withDate ? `${id}-time` : id}
            aria-label={t('ui.time', 'Time')}
            value={withDate ? timeOf(value) : value}
            disabled={!host.live || (withDate && !value)}
            onChange={(event) =>
              props.setValue(
                withDate ? `${dayOf(value)}T${event.target.value}` : event.target.value,
              )
            }
          />
        )}
      </div>
      <Problems id={`${id}-problems`} messages={props.validationErrors} />
    </Field>
  );
});

export const MemberPicker = createComponentImplementation(MemberPickerApi, ({ props }) => {
  const id = useId();
  const host = useUiHost();
  const { t } = useTranslation('assistant');

  const ids = listOf(props.value).flatMap((entry) => {
    const picked = pickedRecord(entry);

    return picked?.kind === 'member' ? [picked.id] : [];
  });

  const members = useMemberOptions(memberQueries, true, ids);

  const named = (memberId: string) =>
    pickedEntry(
      'member',
      memberId,
      members.options.find((option) => option.value === memberId)?.label,
    );

  return (
    <Field label={optionalText(props.label)}>
      <LookupPicker
        multiple={props.multiple === true}
        lookup={members}
        value={ids}
        disabled={!host.live}
        placeholder={t('ui.member-placeholder', 'Choose a team member…')}
        onValueChange={(picked) => props.setValue(picked.map(named))}
      />
      <Problems id={`${id}-problems`} messages={props.validationErrors} />
    </Field>
  );
});
