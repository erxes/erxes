import type { EbarimtPaperSize, EbarimtPrintTemplate } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPrinter } from '@tabler/icons-react';
import {
  Button,
  Label,
  printHtml,
  Select,
  Spinner,
  Textarea,
  ToggleGroup,
  useToast,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { QueryState } from '~/components/QueryState';
import { FormSection } from './FormSection';
import { PrintBlockList } from './PrintBlockList';

type Draft = Pick<EbarimtPrintTemplate, 'paperSize' | 'blocks' | 'headerText' | 'footerText'>;

const PAPER_SIZES: EbarimtPaperSize[] = ['58mm', '80mm', 'a4'];

/** How wide the preview is on screen, as the paper prints. */
const PREVIEW_WIDTH: Record<EbarimtPaperSize, string> = {
  '58mm': '58mm',
  '80mm': '80mm',
  a4: '150mm',
};

const draftOf = ({ paperSize, blocks, headerText, footerText }: EbarimtPrintTemplate): Draft => ({
  paperSize,
  blocks,
  headerText,
  footerText,
});

/** A sample receipt printed with the draft, as it is typed. */
const Preview = ({ draft }: { draft: Draft }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt.print' });
  const [input] = useDebounce(draft, 300);
  const [height, setHeight] = useState(480);

  const preview = useQuery({
    ...orpc.ebarimt.previewPrint.queryOptions({ input }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{t('preview', 'Preview')}</h3>
        <Button
          variant="outline"
          size="sm"
          disabled={!preview.data}
          onClick={() => preview.data && void printHtml(preview.data.html)}
        >
          <IconPrinter />
          {t('test-print', 'Test print')}
        </Button>
      </div>
      <div className="flex min-h-96 justify-center overflow-auto rounded-lg border bg-muted/40 p-4">
        {preview.data ? (
          <iframe
            title={t('preview', 'Preview')}
            sandbox="allow-same-origin"
            srcDoc={preview.data.html}
            className="h-(--preview-height) w-(--preview-width) shrink-0 bg-white shadow-sm"
            style={{
              '--preview-width': PREVIEW_WIDTH[preview.data.paperSize],
              '--preview-height': `${height}px`,
            }}
            onLoad={(event) => {
              const page = event.currentTarget.contentDocument?.documentElement;

              if (page) setHeight(page.scrollHeight + 8);
            }}
          />
        ) : preview.error ? (
          <p className="text-sm text-destructive-text">{messageOf(preview.error)}</p>
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
};

const PaperSize = ({
  value,
  onChange,
}: {
  value: EbarimtPaperSize;
  onChange: (size: EbarimtPaperSize) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt.print' });

  return (
    <ToggleGroup
      variant="outline"
      value={[value]}
      onValueChange={([next]) => {
        const found = PAPER_SIZES.find((size) => size === next);

        if (found) onChange(found);
      }}
    >
      {PAPER_SIZES.map((size) => (
        <ToggleGroup.Item key={size} value={size}>
          {size === 'a4' ? 'A4' : t('roll', '{{size}} roll', { size })}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};

const TextField = ({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        rows={2}
        maxLength={1000}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

const useTemplateMutations = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const { toast } = useToast();
  const client = useQueryClient();

  const options = (title: string) => ({
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: orpc.ebarimt.printTemplates.key() });
      toast({ title });
    },
    onError: (error: Error) =>
      toast({
        variant: 'destructive',
        title: t('save-failed', 'Could not save'),
        description: messageOf(error),
      }),
  });

  return {
    save: useMutation(
      orpc.ebarimt.savePrintTemplate.mutationOptions(options(t('print.saved', 'Template saved'))),
    ),
    reset: useMutation(
      orpc.ebarimt.resetPrintTemplate.mutationOptions(
        options(t('print.was-reset', 'Back to the default template')),
      ),
    ),
  };
};

/** One plugin's template: its parts, paper and texts on the left, the receipt on the right. */
const TemplateEditor = ({ template }: { template: EbarimtPrintTemplate }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt.print' });
  const [draft, setDraft] = useState(() => draftOf(template));
  const { save, reset } = useTemplateMutations();
  const change = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(draftOf(template));

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <div className="min-w-0 space-y-6 xl:col-span-3">
        <FormSection
          title={t('paper', 'Paper')}
          description={t('paper-hint', 'The width of your receipt printer’s roll, or A4.')}
        >
          <PaperSize value={draft.paperSize} onChange={(paperSize) => change({ paperSize })} />
        </FormSection>
        <FormSection
          title={t('parts', 'Parts')}
          description={t(
            'parts-hint',
            'Drag to set the order. Switch a part off to leave it out. The bill, QR code and lottery number are what the tax office asks for.',
          )}
        >
          <PrintBlockList blocks={draft.blocks} onChange={(blocks) => change({ blocks })} />
        </FormSection>
        <FormSection
          title={t('texts', 'Your text')}
          description={t('texts-hint', 'Printed where the header and footer parts are.')}
        >
          <TextField
            label={t('header', 'Header')}
            value={draft.headerText}
            placeholder={t('header-placeholder', 'Welcome!')}
            onChange={(headerText) => change({ headerText })}
          />
          <TextField
            label={t('footer', 'Footer')}
            value={draft.footerText}
            placeholder={t('footer-placeholder', 'Thank you, come again.')}
            onChange={(footerText) => change({ footerText })}
          />
        </FormSection>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {template.updatedAt && (
            <Button
              variant="ghost"
              disabled={reset.isPending}
              onClick={() => reset.mutate({ plugin: template.plugin })}
            >
              {t('reset', 'Use the default')}
            </Button>
          )}
          <Button
            variant="secondary"
            disabled={!dirty || save.isPending}
            onClick={() => setDraft(draftOf(template))}
          >
            {t('discard', 'Discard changes')}
          </Button>
          <Button
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate({ plugin: template.plugin, ...draft })}
          >
            {save.isPending ? <Spinner size="sm" /> : t('save', 'Save template')}
          </Button>
        </div>
      </div>
      <div className="min-w-0 xl:sticky xl:top-4 xl:col-span-2 xl:self-start">
        <Preview draft={draft} />
      </div>
    </div>
  );
};

const PluginPicker = ({
  templates,
  value,
  onChange,
}: {
  templates: EbarimtPrintTemplate[];
  value: string;
  onChange: (plugin: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt.print' });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground">{t('template-for', 'Template for')}</span>
      <Select value={value} onValueChange={onChange}>
        <Select.Trigger className="w-56" aria-label={t('template-for', 'Template for')}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {templates.map((template) => (
            <Select.Item key={template.plugin} value={template.plugin}>
              {template.title}
              {!template.updatedAt && ` · ${t('default', 'default')}`}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

const Templates = ({ templates }: { templates: EbarimtPrintTemplate[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt.print' });
  const [picked, setPicked] = useState<string | null>(null);
  const template = templates.find((item) => item.plugin === picked) ?? templates[0];

  if (!template) {
    return (
      <p className="rounded-lg border p-4 text-sm">
        {t(
          'no-plugins',
          'Pick the plugins eBarimt issues receipts for in Settings. Each one gets its own template here.',
        )}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {t(
          'intro',
          'Each plugin prints its receipts with its own template. Plugins show a Print button on issued receipts.',
        )}
      </p>
      {templates.length > 1 && (
        <PluginPicker templates={templates} value={template.plugin} onChange={setPicked} />
      )}
      <TemplateEditor key={`${template.plugin}:${template.updatedAt ?? ''}`} template={template} />
    </div>
  );
};

/** eBarimt's Print tab: a receipt template for each plugin it issues receipts for. */
export const EbarimtPrint = () => {
  const templates = useQuery(orpc.ebarimt.printTemplates.queryOptions());

  return <QueryState query={templates}>{({ data }) => <Templates templates={data} />}</QueryState>;
};
