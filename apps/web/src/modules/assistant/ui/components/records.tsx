import { createComponentImplementation } from '@erxes/assistant-catalog/react';
import { type RECORD_KINDS, RecordPickerApi } from '@erxes/assistant-catalog';
import { contactSearchQueries, productSearchQueries } from '@erxes/core-contract/client';
import { skipToken } from '@tanstack/react-query';
import { LookupPicker, useContactOptions, useProductOptions, useTagOptions } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { tagsQuery } from '~/modules/tags/useTags';
import { useUiHost } from '../host';
import { Field, Problems } from './field';
import { listOf, optionalText, pickedEntry, pickedRecord } from './values';

type RecordKind = (typeof RECORD_KINDS)[number];

const useRecordOptions = (
  kind: RecordKind,
  tagsOf: 'customer' | 'company',
  ids: string[],
  search: string,
) => {
  const contactType = kind === 'customer' || kind === 'company' ? kind : null;
  const contacts = useContactOptions(contactSearchQueries, contactType, ids, search);
  const products = useProductOptions(productSearchQueries, kind === 'product', ids, search);
  const tags = useTagOptions(tagsQuery(kind === 'tag' ? tagsOf : skipToken), kind === 'tag');

  return { customer: contacts, company: contacts, product: products, tag: tags }[kind];
};

const usePlaceholder = (kind: RecordKind) => {
  const { t } = useTranslation('assistant');

  return {
    customer: t('ui.customer-placeholder', 'Choose a customer…'),
    company: t('ui.company-placeholder', 'Choose a company…'),
    product: t('ui.product-placeholder', 'Choose a product…'),
    tag: t('ui.tag-placeholder', 'Choose a tag…'),
  }[kind];
};

export const RecordPicker = createComponentImplementation(RecordPickerApi, ({ props }) => {
  const id = useId();
  const host = useUiHost();
  const placeholder = usePlaceholder(props.kind);
  const [typed, setTyped] = useState('');
  const [search] = useDebounce(typed, 250);
  const picked = listOf(props.value).flatMap((entry) => pickedRecord(entry) ?? []);
  const ids = picked.map((record) => record.id);
  const lookup = useRecordOptions(props.kind, props.tagsOf ?? 'customer', ids, search);

  const named = (recordId: string) =>
    pickedEntry(
      props.kind,
      recordId,
      lookup.options.find((option) => option.value === recordId)?.label ??
        picked.find((record) => record.id === recordId)?.name,
    );

  return (
    <Field label={optionalText(props.label)}>
      <LookupPicker
        multiple={props.multiple === true}
        lookup={lookup}
        value={ids}
        disabled={!host.live}
        placeholder={placeholder}
        onSearchChange={props.kind === 'tag' ? undefined : setTyped}
        onValueChange={(next) => props.setValue(next.map(named))}
      />
      <Problems id={`${id}-problems`} messages={props.validationErrors} />
    </Field>
  );
});
