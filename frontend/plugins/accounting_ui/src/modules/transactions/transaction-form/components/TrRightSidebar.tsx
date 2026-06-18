import { gql, useQuery } from '@apollo/client';
import { IconActivity, IconExternalLink } from '@tabler/icons-react';
import { ITransactionGroupForm } from '../types/JournalForms';
import { TR_STATUS_LABELS } from '../../types/constants';
import { useWatch } from 'react-hook-form';
import { Badge, Button, ScrollArea, Sheet, useQueryState } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import {
  ActivityLogCustomActivity,
  ActivityLogs,
  AddInternalNote,
  MembersInline,
  TActivityLog,
} from 'ui-modules';

const Sentence = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-1 text-sm text-foreground">
    {children}
  </div>
);

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) {
    return null;
  }

  return (
    <Badge variant="secondary" className="font-medium">
      {TR_STATUS_LABELS[status] || status}
    </Badge>
  );
};

const MentionMembers = ({ memberIds }: { memberIds?: string[] }) => {
  const ids = [...new Set((memberIds || []).filter(Boolean))];

  if (!ids.length) {
    return null;
  }

  return (
    <MembersInline
      memberIds={ids}
      placeholder="Тодорхойгүй хэрэглэгч"
      className="font-medium"
    />
  );
};

const TrCreatedActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const current = activity.changes?.current || {};

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">баримт үүсгэв</span>
      <StatusBadge status={current.status || activity.metadata?.status} />
      <MentionMembers memberIds={current.mentionUserIds} />
    </Sentence>
  );
};

const TrStatusActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const prev = activity.changes?.prev || {};
  const current = activity.changes?.current || {};

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">төлөв өөрчлөв</span>
      <StatusBadge status={prev.status} />
      <span className="text-muted-foreground">-&gt;</span>
      <StatusBadge status={current.status} />
    </Sentence>
  );
};

const TrMentionActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const prev = activity.changes?.prev || {};
  const current = activity.changes?.current || {};

  return (
    <div className="flex flex-col gap-1">
      <Sentence>
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-muted-foreground">батлуулах хэрэглэгч өөрчлөв</span>
      </Sentence>
      <div className="flex flex-wrap items-center gap-2 pl-0 text-sm">
        <span className="text-muted-foreground">Өмнө:</span>
        <MentionMembers memberIds={prev.mentionUserIds} />
        <span className="text-muted-foreground">Одоо:</span>
        <MentionMembers memberIds={current.mentionUserIds} />
      </div>
    </div>
  );
};

const transactionCustomActivities: ActivityLogCustomActivity[] = [
  {
    type: 'transaction.created',
    render: (activity) => <TrCreatedActivityRow activity={activity} />,
  },
  {
    type: 'transaction.status_changed',
    render: (activity) => <TrStatusActivityRow activity={activity} />,
  },
  {
    type: 'transaction.mention_changed',
    render: (activity) => <TrMentionActivityRow activity={activity} />,
  },
];

const DEAL_LINK_QUERY = gql`
  query DealLink($_id: String) {
    dealLink(_id: $_id)
  }
`;

const POS_ORDER_LINK_QUERY = gql`
  query PosOrderLink($_id: String) {
    posOrderLink(_id: $_id)
  }
`;

const isDealContent = (contentType?: string) =>
  ['sales:deal', 'sales:sales.deals'].includes(contentType || '');

const isPosOrderContent = (contentType?: string) =>
  ['sales:order', 'sales:pos.orders'].includes(contentType || '');

const getRelatedContentLabel = (contentType?: string) => {
  if (isDealContent(contentType)) {
    return 'Deal рүү очих';
  }

  if (isPosOrderContent(contentType)) {
    return 'POS order рүү очих';
  }

  return 'Холбоотой бичлэг рүү очих';
};

export const TrRightSidebar = ({ form }: { form: ITransactionGroupForm }) => {
  const { contentId, contentType } = useWatch({ control: form.control });
  const [parentId] = useQueryState<string>('parentId');
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: dealLinkData } = useQuery(DEAL_LINK_QUERY, {
    variables: { _id: contentId },
    skip: !contentId || !isDealContent(contentType),
  });
  const { data: posOrderLinkData } = useQuery(POS_ORDER_LINK_QUERY, {
    variables: { _id: contentId },
    skip: !contentId || !isPosOrderContent(contentType),
  });
  const relatedContentHref =
    dealLinkData?.dealLink?.href || posOrderLinkData?.posOrderLink?.href;

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen} modal>
      <Sheet.Trigger asChild>
        <Button variant="secondary">
          <IconActivity />
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="lg:max-w-1/3 md:max-w-1/2 sm:max-w-md p-0">
        <Sheet.Header className="border-b gap-3 px-6 py-4">
          <Sheet.Title>Activities</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-0 flex flex-col overflow-hidden">
          <div className="h-full flex flex-col">
            {!!relatedContentHref && (
              <div className="border-b px-6 py-3">
                <Button variant="secondary" asChild>
                  <a href={relatedContentHref} target="_blank" rel="noreferrer">
                    <IconExternalLink />
                    {getRelatedContentLabel(contentType)}
                  </a>
                </Button>
              </div>
            )}
            <ScrollArea className="flex-1 min-h-0">
              <div className="pt-3">
                <ActivityLogs
                  targetId={parentId || ''}
                  customActivities={transactionCustomActivities}
                  variant="backward"
                />
              </div>
            </ScrollArea>

            {!!parentId && (
              <div className="shrink-0 pb-6 pt-2">
                <AddInternalNote
                  contentTypeId={parentId}
                  contentType="accounting:transaction"
                />
              </div>
            )}
          </div>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
