import { ReportIdentityField } from '@/tunable-reports/ReportIdentityField';
import { TextareaSetting } from '@/tunable-reports/fields';
import { ReportSettingsSheet } from '@/tunable-reports/ReportSettingsSheet';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import { Button, Form, Spinner, useConfirm } from 'erxes-ui';
import { IconPlus, IconSettings } from '@tabler/icons-react';
import { AccountingTunableReportFieldsFragment } from '~/gql/graphql';
import { reportFormSchema, ReportValues } from '@/tunable-reports/schema';
import {
  newReport,
  newSection,
  reportValues,
  sortReportValues,
} from '@/tunable-reports/values';
import { SortableSections } from '@/tunable-reports/SortableTable';
import { SectionEditor } from '@/tunable-reports/SectionEditor';
import { useReportActions } from '@/tunable-reports/useReports';
import { useReportTranslation } from '@/tunable-reports/locales';
import { notifyMutationResult } from '@/utils/graphqlMutation';

export const ReportEditor = ({
  report,
}: {
  report?: AccountingTunableReportFieldsFragment;
}) => {
  const { t } = useReportTranslation();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const actions = useReportActions();
  const canEdit = !report || actions.canManage;
  const form = useForm<ReportValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: report
      ? sortReportValues(reportValues(report))
      : { ...newReport(t('section')), code: '', name: '' },
  });
  const sections = useFieldArray({ control: form.control, name: 'sections' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  useBeforeUnload((event) => {
    if (form.formState.isDirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  const save = form.handleSubmit(
    async (values) => {
      try {
        const saved = await actions.saveReport(values, report);
        if (saved) {
          form.reset(sortReportValues(reportValues(saved)));
          setSettingsOpen(false);
          navigate(`/accounting/tunable-reports/${saved._id}/edit`, {
            replace: true,
          });
        }
      } catch {
        /* Apollo mutation feedback is handled by useReportActions. */
      }
    },
    (errors) => {
      setSettingsOpen(
        Boolean(errors.orientation || errors.status || errors.description),
      );
      notifyMutationResult(false, t('invalid'));
    },
  );
  const cancel = async () => {
    if (form.formState.isDirty) {
      try {
        await confirm({ message: t('discardConfirm') });
      } catch {
        return;
      }
    }
    navigate('/accounting/tunable-reports');
  };
  const removeSection = async (index: number) => {
    const item = form.getValues(`sections.${index}`);
    if (
      form
        .getValues('sections')
        .some(
          (section) =>
            section._id !== item._id &&
            section.formulas.some((formula) =>
              [formula.source, formula.ratioSource].some(
                (source) =>
                  source &&
                  (!source.reportId || source.reportId === report?._id) &&
                  source.sectionId === item._id,
              ),
            ),
        )
    ) {
      notifyMutationResult(false, t('referenced'));
      return;
    }
    try {
      await confirm({ message: t('removeSectionConfirm') });
    } catch {
      return;
    }
    sections.remove(index);
  };
  return (
    <Form {...form}>
      <form onSubmit={save} className="space-y-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <fieldset
              disabled={!canEdit || actions.saving || actions.removing}
              className="min-w-0"
            >
              <ReportIdentityField form={form} />
            </fieldset>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSettingsOpen(true)}
          >
            <IconSettings />
            {t('reportSettings')}
          </Button>
        </div>
        <fieldset
          disabled={!canEdit || actions.saving || actions.removing}
          className="min-w-0 space-y-6"
        >
          <TextareaSetting form={form} name="header" label={t('header')} />
          <SortableSections
            items={sections.fields}
            move={sections.move}
            render={(_section, index) => (
              <SectionEditor
                form={form}
                index={index}
                reportId={report?._id}
                revealErrors={
                  !settingsOpen &&
                  index ===
                    sections.fields.findIndex(
                      (_section, sectionIndex) =>
                        form.formState.errors.sections?.[sectionIndex],
                    )
                }
                onRemove={
                  sections.fields.length > 1
                    ? () => removeSection(index)
                    : undefined
                }
              />
            )}
          />
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full border-dashed text-muted-foreground"
            onClick={() => sections.append(newSection())}
          >
            <IconPlus />
            {t('addSection')}
          </Button>
          <TextareaSetting form={form} name="footer" label={t('footer')} />
        </fieldset>
        <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t bg-background py-3">
          <Button
            type="button"
            variant="outline"
            disabled={actions.saving}
            onClick={() => void cancel()}
          >
            {t('cancel')}
          </Button>
          {canEdit && (
            <Button type="submit" disabled={actions.saving || actions.removing}>
              {actions.saving && <Spinner />}
              {t('save')}
            </Button>
          )}
        </div>
        <ReportSettingsSheet
          form={form}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onSave={save}
          canEdit={canEdit}
          busy={actions.saving || actions.removing}
          onRemove={
            report && actions.canRemove
              ? async () => {
                  if (await actions.removeReport(report))
                    navigate('/accounting/tunable-reports');
                }
              : undefined
          }
        />
      </form>
    </Form>
  );
};
