import { EmailTemplateActions } from '@/emailTemplates/components/EmailTemplateActions';
import { EmailTemplatePreview } from '@/emailTemplates/components/EmailTemplatePreview';
import { emailTemplateFormat, IEmailTemplate } from '@/emailTemplates/types';
import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { IconCalendarPlus, IconMail } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Card, RelativeDateDisplay, Spinner } from 'erxes-ui';
import { useNavigate } from 'react-router';
import { MembersInline } from 'ui-modules';

const FORMAT_LABEL = {
  maily: 'Email editor',
  blocks: 'Blocks',
};

export const EmailTemplatesGrid = ({
  templates,
  loading,
  onRemove,
}: {
  templates: IEmailTemplate[];
  loading: boolean;
  onRemove: (id: string) => void;
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => (
        <Card
          key={template._id}
          className="group flex cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md"
          onClick={() =>
            navigate(`${EmailTemplatePath.Index}/${template._id}`)
          }
        >
          <Card.Content className="relative flex h-40 items-center justify-center overflow-hidden border-b bg-muted/30 p-0">
            <EmailTemplatePreview template={template} />
            <span className="absolute right-0 top-0 mr-2 mt-2 whitespace-nowrap rounded-lg border bg-background px-2 py-1 text-xs">
              {FORMAT_LABEL[emailTemplateFormat(template)]}
            </span>
          </Card.Content>

          <div className="flex items-start justify-between gap-2 p-4">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <IconMail className="size-4" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold leading-tight">
                  {template.name || 'Untitled'}
                </h3>
                {template.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {template.description}
                  </p>
                )}
              </div>
            </div>
            <EmailTemplateActions
              templateId={template._id}
              onRemove={onRemove}
            />
          </div>

          <Card.Footer className="flex items-center justify-between border-t px-4 py-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <IconCalendarPlus size={16} />
              <span className="text-xs">
                {template.createdAt ? (
                  <RelativeDateDisplay.Value
                    value={dayjs(template.createdAt).format(
                      'YYYY-MM-DD HH:mm:ss',
                    )}
                  />
                ) : (
                  'N/A'
                )}
              </span>
            </div>
            <MembersInline.Provider
              members={template.createdUser ? [template.createdUser] : []}
            >
              <MembersInline.Avatar size="lg" />
            </MembersInline.Provider>
          </Card.Footer>
        </Card>
      ))}
    </div>
  );
};
