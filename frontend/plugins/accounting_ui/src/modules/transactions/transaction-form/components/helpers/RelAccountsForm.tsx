import { zodResolver } from '@hookform/resolvers/zod';
import { IconX } from '@tabler/icons-react';
import { Button, Form, Input, cn } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { type ReactNode, useId, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { relatedAccountReplacementSchema } from '../../contants/transactionSchema';
import { followTrDocsState } from '../../states/trStates';
import type { ITransactionGroupForm } from '../../types/JournalForms';
import {
  getRelatedAccountGroups,
  RELATED_ACCOUNT_SIDES,
  type IRelatedAccountRow,
  type TRelatedAccountReplacement,
} from '../../utils/relatedAccounts';
import { isHiddenTransaction } from '../utils';

const replacementFormSchema = z.object({
  replacements: z.array(relatedAccountReplacementSchema),
});

type TReplacementForm = z.infer<typeof replacementFormSchema>;

type TAccountSide = (typeof RELATED_ACCOUNT_SIDES)[number];

const SIDE_LABELS = { dt: 'debit', ct: 'credit' };

const postedCodes = (rows: IRelatedAccountRow[], side: TAccountSide) => [
  ...new Set(
    rows.filter((row) => row.side === side).flatMap((row) => row.accounts),
  ),
];

const TAccount = ({
  renderSide,
}: {
  renderSide: (side: TAccountSide) => ReactNode;
}) => {
  const { t } = useTranslation('accounting');
  const id = useId();

  return (
    <div className="grid grid-cols-2 divide-x divide-border">
      {RELATED_ACCOUNT_SIDES.map((side) => (
        <div
          key={side}
          role="group"
          aria-labelledby={`${id}-${side}`}
          className="min-w-0"
        >
          <div
            id={`${id}-${side}`}
            className="border-b border-border px-2 py-1.5 text-center text-xs font-semibold uppercase"
          >
            {t(SIDE_LABELS[side])}
          </div>
          <div className="min-h-10 px-2 py-2">{renderSide(side)}</div>
        </div>
      ))}
    </div>
  );
};

const RestrictedRows = ({
  rows,
  hiddenIds,
}: {
  rows: IRelatedAccountRow[];
  hiddenIds: Set<string | undefined>;
}) => {
  const { t } = useTranslation('accounting');

  return rows
    .filter(({ transactionId }) => hiddenIds.has(transactionId))
    .map(({ transactionId }, index) => (
      <p key={transactionId ?? index} className="text-xs text-muted-foreground">
        {t('restricted-transaction')}
      </p>
    ));
};

const EditRelatedAccounts = ({
  groups,
  entries,
  onApply,
  onReset,
  onCancel,
  disabled,
  hiddenIds,
}: {
  groups: ReturnType<typeof getRelatedAccountGroups>;
  entries: TRelatedAccountReplacement[];
  onApply: (entries: TRelatedAccountReplacement[]) => void;
  onReset: () => void;
  onCancel: () => void;
  disabled: boolean;
  hiddenIds: Set<string | undefined>;
}) => {
  const { t } = useTranslation('accounting');
  const form = useForm<TReplacementForm>({
    defaultValues: { replacements: entries },
    resolver: zodResolver(replacementFormSchema),
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'replacements',
  });
  const liveEntries = useWatch({ control: form.control, name: 'replacements' });
  const [clearedFields, setClearedFields] = useState<Set<string>>(new Set());
  const hideField = (id: string) =>
    setClearedFields((previous) => new Set([...previous, id]));

  return (
    <Form {...form}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(({ replacements }) => {
          if (!disabled) {
            onApply(
              replacements.filter(
                ({ code, replacement }) => code !== replacement,
              ),
            );
          }
        })}
      >
        {[...groups].map(([ptrId, rows], groupIndex) => (
          <div key={ptrId} className="space-y-2">
            {groups.size > 1 && (
              <h4 className="text-sm font-medium">
                {t('transaction')} {groupIndex + 1}
              </h4>
            )}
            <TAccount
              renderSide={(side) => {
                const sideFields = fields
                  .map((entry, index) => ({ entry, index }))
                  .filter(
                    ({ entry }) =>
                      entry.ptrId === ptrId &&
                      entry.side === side &&
                      (!entry.code || !!entry.replacement) &&
                      !clearedFields.has(entry.id),
                  );

                const fieldCodes = new Set(
                  sideFields.map(({ index }) =>
                    liveEntries[index]?.replacement.trim(),
                  ),
                );
                const linkedCodes = postedCodes(
                  rows.filter(
                    (row) => !row.isMain && !hiddenIds.has(row.transactionId),
                  ),
                  side,
                ).filter((code) => !fieldCodes.has(code));

                return (
                  <div className="space-y-1.5">
                    {sideFields.map(({ entry, index }, sideIndex) => (
                      <Form.Field
                        key={entry.id}
                        control={form.control}
                        name={`replacements.${index}.replacement`}
                        render={({ field }) => (
                          <Form.Item className="relative space-y-0">
                            <Form.Label className="sr-only">
                              {entry.code || t('add-account')}
                            </Form.Label>
                            <Form.Control>
                              <Input
                                {...field}
                                disabled={disabled}
                                className="h-8 pr-8 font-mono tabular-nums"
                                placeholder={
                                  entry.code
                                    ? undefined
                                    : t('enter-account-code')
                                }
                                onBlur={(event) => {
                                  field.onBlur();
                                  if (
                                    !(
                                      event.relatedTarget instanceof
                                      HTMLButtonElement
                                    ) &&
                                    !event.target.value.trim() &&
                                    (entry.code ||
                                      sideIndex !== sideFields.length - 1)
                                  ) {
                                    hideField(entry.id);
                                  }
                                }}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  field.onChange(value);
                                  if (
                                    !entry.code &&
                                    value.trim() &&
                                    sideIndex === sideFields.length - 1
                                  ) {
                                    append(
                                      {
                                        ptrId,
                                        side,
                                        code: '',
                                        replacement: '',
                                      },
                                      { shouldFocus: false },
                                    );
                                  }
                                }}
                              />
                            </Form.Control>
                            {!!field.value && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={disabled}
                                className="absolute right-0.5 top-0.5 size-7 text-muted-foreground"
                                aria-label={`${t('delete')} ${field.value}`}
                                onClick={() => {
                                  field.onChange('');
                                  if (
                                    entry.code ||
                                    sideIndex !== sideFields.length - 1
                                  ) {
                                    hideField(entry.id);
                                  }
                                }}
                              >
                                <IconX />
                              </Button>
                            )}
                          </Form.Item>
                        )}
                      />
                    ))}
                    {linkedCodes.map((code) => (
                      <p
                        key={code}
                        className="px-2 font-mono text-sm text-muted-foreground"
                      >
                        {code}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <RestrictedRows rows={rows} hiddenIds={hiddenIds} />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" disabled={disabled}>
            {t('save-and-close')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={onReset}
          >
            {t('safe-import-reset-mapping')}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            {t('cancel-label')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const RelatedAccountLedger = ({
  groups,
  hiddenIds,
  custom = false,
}: {
  groups: ReturnType<typeof getRelatedAccountGroups>;
  hiddenIds: Set<string | undefined>;
  custom?: boolean;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <div className="space-y-3">
      {[...groups].map(([ptrId, rows], index) => {
        const visibleRows = rows.filter(
          ({ transactionId }) => !hiddenIds.has(transactionId),
        );
        const mainRows = visibleRows.filter((row) => row.isMain);

        if (
          custom &&
          !mainRows.some((row) => row.dt.differs || row.ct.differs)
        ) {
          return null;
        }

        return (
          <div key={ptrId} className="space-y-1.5">
            {groups.size > 1 && (
              <p className="text-xs text-muted-foreground">
                {t('transaction')} {index + 1}
              </p>
            )}
            <TAccount
              renderSide={(side) => {
                const posted = postedCodes(visibleRows, side);
                const differs =
                  custom && mainRows.some((row) => row[side].differs);
                const codes = differs
                  ? [
                      ...new Set([
                        ...mainRows.flatMap((row) => row[side].codes),
                        ...posted.filter(
                          (code) =>
                            !mainRows.some((row) =>
                              row[side].defaults.includes(code),
                            ),
                        ),
                      ]),
                    ]
                  : posted;

                return codes.length ? (
                  <ul
                    className={cn(
                      'space-y-1 text-center font-mono text-sm tabular-nums',
                      differs && 'font-semibold text-primary',
                    )}
                  >
                    {codes.map((code) => (
                      <li key={code} className="break-all">
                        {code}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">—</p>
                );
              }}
            />
            {!custom && <RestrictedRows rows={rows} hiddenIds={hiddenIds} />}
          </div>
        );
      })}
    </div>
  );
};

export const RelAccountsForm = ({
  form,
  canEdit,
}: {
  form: ITransactionGroupForm;
  canEdit: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const headingId = useId();
  const [draft, setDraft] = useState<TRelatedAccountReplacement[] | null>(null);
  const trDocs =
    useWatch({
      control: form.control,
      name: 'trDocs',
      defaultValue: form.getValues('trDocs'),
    }) || [];
  const replacements =
    useWatch({
      control: form.control,
      name: 'relatedAccountReplacements',
      defaultValue: form.getValues('relatedAccountReplacements'),
    }) || [];
  const followTrDocs = useAtomValue(followTrDocsState);
  const groups = getRelatedAccountGroups(trDocs, followTrDocs, replacements);
  const hiddenIds = new Set(
    [...trDocs, ...followTrDocs]
      .filter(isHiddenTransaction)
      .map((tr) => tr._id),
  );
  const editable =
    canEdit &&
    ![...groups.values()].some((rows) =>
      rows.some(({ transactionId }) => hiddenIds.has(transactionId)),
    );
  const hasCustom = [...groups.values()].some((rows) =>
    rows.some((row) => row.isMain && (row.dt.differs || row.ct.differs)),
  );
  const resetToCalculated = () => {
    form.getValues('trDocs').forEach((tr, index) => {
      if (tr.relAccounts) {
        form.setValue(`trDocs.${index}.relAccounts`, undefined, {
          shouldDirty: true,
        });
      }
    });
    form.setValue('relatedAccountReplacements', [], { shouldDirty: true });
    setDraft(null);
  };
  const openEditor = () => {
    const entries = [...groups].flatMap(([ptrId, rows]) =>
      RELATED_ACCOUNT_SIDES.flatMap((side) => {
        const sideReplacements = replacements.filter(
          (entry) => entry.ptrId === ptrId && entry.side === side,
        );
        const baseCodes = new Set(
          rows.filter((row) => row.isMain).flatMap((row) => row[side].base),
        );

        return [
          ...[...baseCodes].map((code) => ({
            ptrId,
            side,
            code,
            replacement:
              sideReplacements.find((entry) => entry.code === code)
                ?.replacement ?? code,
          })),
          ...sideReplacements.filter(
            (entry) => !entry.code && entry.replacement,
          ),
          { ptrId, side, code: '', replacement: '' },
        ];
      }),
    );
    setDraft(entries);
  };

  return (
    <section className="mt-3 space-y-3 border-t pt-3">
      <section
        aria-labelledby={`${headingId}-calculated`}
        className="space-y-2"
      >
        <h3 id={`${headingId}-calculated`} className="text-sm font-semibold">
          {t('corresponding-account')}
        </h3>
        {groups.size ? (
          <RelatedAccountLedger groups={groups} hiddenIds={hiddenIds} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('no-transactions')}
          </p>
        )}
      </section>
      {!!groups.size && (
        <section
          aria-labelledby={`${headingId}-custom`}
          className="space-y-2 border-t pt-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 id={`${headingId}-custom`} className="text-sm font-semibold">
              {t('difference')}
            </h3>
            {!draft && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                aria-label={t('edit-corresponding-accounts')}
                disabled={!canEdit}
                onClick={openEditor}
              >
                {t('edit')}
              </Button>
            )}
          </div>
          {draft ? (
            <EditRelatedAccounts
              groups={groups}
              entries={draft}
              disabled={!editable}
              hiddenIds={hiddenIds}
              onApply={(values) => {
                form.setValue('relatedAccountReplacements', values, {
                  shouldDirty: true,
                });
                setDraft(null);
              }}
              onCancel={() => setDraft(null)}
              onReset={resetToCalculated}
            />
          ) : hasCustom ? (
            <RelatedAccountLedger
              groups={groups}
              hiddenIds={hiddenIds}
              custom
            />
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </section>
      )}
    </section>
  );
};
