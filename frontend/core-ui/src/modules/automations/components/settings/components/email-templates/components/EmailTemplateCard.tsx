import { IconDots, IconMail, IconTrash } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { Button, Card, DropdownMenu } from 'erxes-ui';
import { Link } from 'react-router';
import { IAutomationEmailTemplate } from '@/automations/components/settings/components/email-templates/types/automationEmailTemplates';

interface EmailTemplateCardProps {
  template: IAutomationEmailTemplate;
  onRemove: (id: string) => void;
}

export function EmailTemplateCard({
  template,
  onRemove,
}: EmailTemplateCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(template._id);
  };

  return (
    <Card className="h-auto p-4 flex flex-col gap-3 rounded-lg hover:shadow-md transition-shadow">
      <Link to={`/settings/automations/email-templates/${template._id}`}>
        <div className="flex gap-3 items-start">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <IconMail className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h6 className="font-semibold text-sm truncate">{template.name}</h6>
            {template.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {template.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>
                Created {formatDistanceToNow(new Date(template.createdAt))} ago
              </span>
              {template.createdUser && (
                <>
                  <span>•</span>
                  <span>by {template.createdUser.details.fullName}</span>
                </>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <IconDots className="size-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item
                onClick={handleRemove}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="size-4 mr-2" />
                Remove
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
      </Link>
    </Card>
  );
}
