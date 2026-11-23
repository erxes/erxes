import type { EmailTemplate } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconDeviceFloppy, IconSpeakerphone, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  AppBreadcrumb,
  Button,
  Input,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  useFormat,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { EmailEditor } from '../EmailEditor';
import { useRemoveTemplate, useTemplateDraft } from './useEmailTemplates';

/** A template's name and message, saved on demand; those who manage broadcasts change it. */
const TemplateEditor = ({ template }: { template: EmailTemplate }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const navigate = useNavigate();
  const canManage = useCan()('broadcasts.manage');
  const editor = useTemplateDraft(template);
  const { remove, pending } = useRemoveTemplate(() => void navigate(paths.broadcasts.templates));

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Broadcasts'),
                to: paths.broadcasts.list,
                icon: IconSpeakerphone,
              },
              { label: t('templates.title', 'Templates'), to: paths.broadcasts.templates },
              { label: template.name, to: paths.broadcasts.template(template.id) },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <span className="text-xs text-muted-foreground">
            {editor.dirty
              ? t('unsaved', 'Unsaved changes')
              : t('saved-at', 'Saved {{when}}', { when: fmt.relative(template.updatedAt) })}
          </span>
          {canManage && (
            <>
              <Button variant="outline" disabled={pending} onClick={() => remove(template)}>
                <IconTrash />
                {t('templates.delete', 'Delete')}
              </Button>
              <Button disabled={!editor.dirty || editor.saving} onClick={editor.save}>
                {editor.saving ? <Spinner size="sm" /> : <IconDeviceFloppy />}
                {t('save', 'Save')}
              </Button>
            </>
          )}
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <Input
            aria-label={t('templates.name', 'Name')}
            value={editor.draft.name}
            maxLength={100}
            disabled={!canManage}
            onChange={(event) => editor.change({ name: event.target.value })}
          />
          <EmailEditor
            label={t('body-email', 'Message')}
            value={editor.draft.content}
            onChange={(content) => editor.change({ content })}
          />
        </div>
      </ScrollArea>
    </>
  );
};

/** One template, opened from Broadcasts › Templates. */
export const TemplatePage = () => {
  const { id = '' } = useParams();
  const template = useQuery(orpc.emailTemplates.get.queryOptions({ input: { id } }));

  return (
    <PageContainer>
      <QueryState query={template} className="py-12">
        {(data) => <TemplateEditor key={data.id} template={data} />}
      </QueryState>
    </PageContainer>
  );
};
