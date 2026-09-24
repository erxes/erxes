import { EmailTemplateActions } from '@/emailTemplates/components/EmailTemplateActions';
import { EmailTemplatePreview } from '@/emailTemplates/components/EmailTemplatePreview';
import {
  EmailTemplatesEmptyState,
  EmailTemplatesErrorState,
} from '@/emailTemplates/components/EmailTemplatesStates';
import { useEmailTemplates } from '@/emailTemplates/hooks/useEmailTemplates';
import { emailTemplateFormat, IEmailTemplate } from '@/emailTemplates/types';
import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { IconCalendarPlus, IconMail } from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  Card,
  EnumCursorDirection,
  RelativeDateDisplay,
  ScrollArea,
  Skeleton,
} from 'erxes-ui';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router';
import { MembersInline } from 'ui-modules';

const FORMAT_LABEL = {
  maily: 'Email editor',
  blocks: 'Blocks',
};

const INITIAL_SKELETON_COUNT = 8;
const FETCH_MORE_SKELETON_COUNT = 4;

const EmailTemplateCardSkeleton = () => (
  <Card className="flex flex-col gap-4 border p-4">
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-3 w-1/2" />
  </Card>
);

/** Reaching the end of the grid fetches the next page, as the table does. */
const EmailTemplateCardsForwardSkeleton = ({
  root,
  handleFetchMore,
}: {
  root: Element | null;
  handleFetchMore: ({ direction }: { direction: EnumCursorDirection }) => void;
}) => {
  const { ref } = useInView({
    root,
    onChange: (inView) =>
      inView && handleFetchMore({ direction: EnumCursorDirection.FORWARD }),
  });

  return (
    <>
      <div ref={ref}>
        <EmailTemplateCardSkeleton />
      </div>
      {Array.from({ length: FETCH_MORE_SKELETON_COUNT - 1 }).map((_, index) => (
        <EmailTemplateCardSkeleton key={index} />
      ))}
    </>
  );
};

const EmailTemplateCard = ({ template }: { template: IEmailTemplate }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group flex cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md"
      onClick={() => navigate(`${EmailTemplatePath.Index}/${template._id}`)}
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
        <EmailTemplateActions templateId={template._id} />
      </div>

      <Card.Footer className="flex items-center justify-between border-t px-4 py-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <IconCalendarPlus size={16} />
          <span className="text-xs">
            {template.createdAt ? (
              <RelativeDateDisplay.Value
                value={dayjs(template.createdAt).format('YYYY-MM-DD HH:mm:ss')}
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
  );
};

export const EmailTemplatesGrid = () => {
  const { emailTemplates, pageInfo, loading, error, refetch, handleFetchMore } =
    useEmailTemplates();

  // Held in state so the observer re-registers once the viewport is mounted.
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );

  if (error) {
    return <EmailTemplatesErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!loading && !emailTemplates.length) {
    return <EmailTemplatesEmptyState />;
  }

  return (
    <ScrollArea.Root className="h-full w-full">
      <ScrollArea.Viewport ref={setScrollElement}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3 p-3">
          {emailTemplates.map((template) => (
            <EmailTemplateCard key={template._id} template={template} />
          ))}
          {loading &&
            Array.from({ length: INITIAL_SKELETON_COUNT }).map((_, index) => (
              <EmailTemplateCardSkeleton key={index} />
            ))}
          {pageInfo?.hasNextPage && !loading && (
            <EmailTemplateCardsForwardSkeleton
              root={scrollElement}
              handleFetchMore={handleFetchMore}
            />
          )}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Bar orientation="vertical" />
    </ScrollArea.Root>
  );
};
