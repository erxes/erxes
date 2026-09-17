import { IconPlus, IconRestore, IconTrash } from '@tabler/icons-react';
import { Accordion, Button, Form, Input, Separator, Textarea } from 'erxes-ui';
import { TFunction } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import {
  Control,
  useFieldArray,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';
import { StyleImageField } from '@/helpcenter/components/help-center-drawer/HelpCenterStyleFields';
import {
  createEmptyFooterColumn,
  DEFAULT_HELP_CENTER_FOOTER_COLUMNS,
} from '@/helpcenter/constants';
import { IHelpCenterConfigInput, TFooterColumnName } from '@/helpcenter/types';

function FooterLinkRows({
  control,
  columnName,
  t,
}: Readonly<{
  control: Control<IHelpCenterConfigInput>;
  columnName: TFooterColumnName;
  t: TFunction;
}>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${columnName}.links`,
  });

  return (
    <div className="flex flex-col gap-2">
      {fields.length ? (
        fields.map((link, index) => (
          <div key={link.id} className="flex gap-2 items-start">
            <Form.Field
              control={control}
              name={`${columnName}.links.${index}.label`}
              render={({ field }) => (
                <Form.Item className="flex-1 space-y-0">
                  <Form.Control>
                    <Input
                      {...field}
                      className="h-8"
                      placeholder={t('kb-footer-link-label', 'Link label')}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name={`${columnName}.links.${index}.url`}
              render={({ field }) => (
                <Form.Item className="flex-1 space-y-0">
                  <Form.Control>
                    <Input
                      {...field}
                      className="h-8 font-mono text-xs"
                      placeholder="/knowledge-base"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="w-8 h-8 shrink-0"
              aria-label={t('kb-footer-remove-link', 'Remove link')}
              onClick={() => remove(index)}
            >
              <IconTrash className="w-4 h-4" />
            </Button>
          </div>
        ))
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('kb-footer-no-links', 'This column has no links yet.')}
        </p>
      )}

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="self-start"
        onClick={() => append({ label: '', url: '' })}
      >
        <IconPlus className="mr-2 w-4 h-4" />
        {t('kb-footer-add-link', 'Add link')}
      </Button>
    </div>
  );
}

function FooterColumnSummary({
  control,
  index,
  t,
}: Readonly<{
  control: Control<IHelpCenterConfigInput>;
  index: number;
  t: TFunction;
}>) {
  const heading = useWatch({
    control,
    name: `footer.columns.${index}.heading`,
  });
  const links = useWatch({ control, name: `footer.columns.${index}.links` });
  const count = (links ?? []).filter((link) => link.label && link.url).length;

  return (
    <span className="flex gap-2 items-baseline min-w-0">
      <span className="text-sm font-medium truncate">
        {heading?.trim() || t('kb-footer-column-untitled', 'Untitled column')}
      </span>
      <span className="text-xs shrink-0 text-muted-foreground">
        {t('kb-footer-column-link-count', '{{count}} links', { count })}
      </span>
    </span>
  );
}

function FooterColumnsField({
  form,
  t,
}: Readonly<{
  form: UseFormReturn<IHelpCenterConfigInput>;
  t: TFunction;
}>) {
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'footer.columns',
  });
  const [open, setOpen] = useState<string[]>([]);
  const counted = useRef(fields.length);

  useEffect(() => {
    if (fields.length > counted.current) {
      const added = fields.slice(counted.current).map((column) => column.id);

      setOpen((current) => [...current, ...added]);
    }

    counted.current = fields.length;
  }, [fields]);

  return (
    <div className="flex flex-col gap-3">
      {fields.length ? (
        <Accordion type="multiple" value={open} onValueChange={setOpen}>
          {fields.map((column, index) => (
            <Accordion.Item
              key={column.id}
              value={column.id}
              className="last:border-b-0"
            >
              <div className="flex gap-1 items-center">
                <div className="flex-1 min-w-0">
                  <Accordion.Trigger className="py-2.5 hover:no-underline">
                    <FooterColumnSummary
                      control={control}
                      index={index}
                      t={t}
                    />
                  </Accordion.Trigger>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={t('kb-footer-remove-column', 'Remove column')}
                  onClick={() => remove(index)}
                >
                  <IconTrash className="w-4 h-4" />
                </Button>
              </div>
              <Accordion.Content className="flex flex-col gap-3 pb-3">
                <Form.Field
                  control={control}
                  name={`footer.columns.${index}.heading`}
                  render={({ field }) => (
                    <Form.Item className="pr-10">
                      <Form.Label className="font-normal text-muted-foreground">
                        {t('kb-footer-column-heading', 'Column heading')}
                      </Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          className="h-8"
                          placeholder={t('kb-footer-column-support', 'Support')}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <FooterLinkRows
                  control={control}
                  columnName={`footer.columns.${index}`}
                  t={t}
                />
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t(
            'kb-footer-columns-empty',
            'No columns yet — the site shows its built-in Support, Knowledge base and Account columns.',
          )}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append(createEmptyFooterColumn())}
        >
          <IconPlus className="mr-2 w-4 h-4" />
          {t('kb-footer-add-column', 'Add column')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() =>
            form.setValue(
              'footer.columns',
              DEFAULT_HELP_CENTER_FOOTER_COLUMNS.map((column) => ({
                heading: column.heading,
                links: column.links.map((link) => ({ ...link })),
              })),
              { shouldDirty: true },
            )
          }
        >
          <IconRestore className="mr-2 w-4 h-4" />
          {t('kb-footer-use-defaults', 'Start from the built-in columns')}
        </Button>
      </div>
    </div>
  );
}

export function HelpCenterFooterFields({
  form,
  t,
}: Readonly<{
  form: UseFormReturn<IHelpCenterConfigInput>;
  t: TFunction;
}>) {
  const control = form.control;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <StyleImageField
          control={control}
          name="footer.logo"
          label={t('kb-footer-logo', 'Footer logo')}
          description={t(
            'kb-footer-logo-description',
            'Replaces the erxes wordmark above the footer text.',
          )}
        />
        <Form.Field
          control={control}
          name="footer.description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('kb-footer-description', 'Footer description')}
              </Form.Label>
              <Form.Description>
                {t(
                  'kb-footer-description-hint',
                  'Leave empty to keep the default sentence built from the help center name.',
                )}
              </Form.Description>
              <Form.Control>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={t(
                    'kb-footer-description-placeholder',
                    'Search the knowledge base for your answer, and reach out to the support team if you cannot find it.',
                  )}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        control={control}
        name="footer.copyright"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t('kb-footer-copyright', 'Copyright line')}
            </Form.Label>
            <Form.Description>
              {t(
                'kb-footer-copyright-hint',
                '{year} is replaced with the current year. Leave empty for the default line.',
              )}
            </Form.Description>
            <Form.Control>
              <Input
                {...field}
                placeholder="© {year} erxes. All rights reserved."
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">
            {t('kb-footer-columns', 'Footer link columns')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              'kb-footer-columns-hint',
              'Once a column is saved these replace the built-in ones. A link needs both a label and an address to be kept.',
            )}
          </p>
        </div>

        <FooterColumnsField form={form} t={t} />
      </div>
    </div>
  );
}
