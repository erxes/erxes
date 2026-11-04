import {
  IconDownload,
  IconEdit,
  IconMessageReply,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  Empty,
  Input,
  Select,
  Spinner,
  Table,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useMutation, useQuery } from 'erxes-sdk/react';
import { useEffect, useState } from 'react';
import { Can } from 'ui-modules';
import { useDebounce } from 'use-debounce';
import {
  REFETCH_LISTS,
  RESPONSE_TEMPLATE_CHANNELS,
  RESPONSE_TEMPLATE_IMPORT,
  RESPONSE_TEMPLATE_REMOVE,
  RESPONSE_TEMPLATES_LIST,
  type StoredTemplate,
} from './graphql';
import { ResponseTemplateSheet } from './ResponseTemplateSheet';
import { can, errorMessage, previewText } from './utils';

const PER_PAGE = 20;
const ALL = 'all';

type SheetState = { open: false } | { open: true; template?: StoredTemplate };

const ImportButton = () => {
  const [importPage, { loading, client }] = useMutation(
    RESPONSE_TEMPLATE_IMPORT,
  );

  // One page per call keeps each call inside the runtime's time limit.
  const runImport = async () => {
    let imported = 0;
    let cursor: string | undefined;

    try {
      do {
        const { data } = await importPage({ variables: { cursor } });
        const page = data?.responseTemplatesImportFromFrontline;
        imported += page?.imported ?? 0;
        cursor = page?.nextCursor ?? undefined;
      } while (cursor);

      toast({
        title:
          imported === 0
            ? 'No new templates in frontline'
            : `Imported ${imported} template${imported === 1 ? '' : 's'}`,
        variant: 'success',
      });
    } catch (e) {
      toast({
        title: 'Import failed',
        description: errorMessage(e),
        variant: 'destructive',
      });
    } finally {
      // Once, after the last page, not once per page. Also after a failure:
      // the pages before it were imported.
      void client.refetchQueries({ include: REFETCH_LISTS });
    }
  };

  return (
    <Button variant="outline" onClick={runImport} disabled={loading}>
      {loading ? <Spinner size="sm" /> : <IconDownload />}
      Import from frontline
    </Button>
  );
};

const RemoveButton = ({ template }: { template: StoredTemplate }) => {
  const { confirm } = useConfirm();
  const [remove, { loading }] = useMutation(RESPONSE_TEMPLATE_REMOVE, {
    refetchQueries: REFETCH_LISTS,
  });

  const onRemove = () =>
    confirm({
      message: `Delete "${template.name}"?`,
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      try {
        await remove({ variables: { _id: template._id } });
        toast({ title: 'Template deleted', variant: 'success' });
      } catch (e) {
        toast({
          title: 'Could not delete',
          description: errorMessage(e),
          variant: 'destructive',
        });
      }
    });

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Delete"
      onClick={onRemove}
      disabled={loading}
    >
      {loading ? <Spinner size="sm" /> : <IconTrash />}
    </Button>
  );
};

/** Frontline > Response templates: every template, by channel. */
export const ResponseTemplates = () => {
  const [channelId, setChannelId] = useState(ALL);
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search.trim(), 300);
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState<SheetState>({ open: false });

  const channels = useQuery(RESPONSE_TEMPLATE_CHANNELS);
  const channelList = channels.data?.responseTemplatesChannels;
  const list = useQuery(RESPONSE_TEMPLATES_LIST, {
    variables: {
      channelId: channelId === ALL ? undefined : channelId,
      searchValue: searchValue || undefined,
      page,
      perPage: PER_PAGE,
    },
  });
  const { loading, error, refetch } = list;
  // The last page stays on screen while the next one loads.
  const data = (list.data ?? list.previousData)?.responseTemplatesList;

  const totalCount = data?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const channelName = (id: string) =>
    channelList?.find((channel) => channel._id === id)?.name ?? '-';

  // A delete on the last page can leave it empty.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Response templates</h1>
          <p className="text-sm text-muted-foreground">
            Saved replies agents insert from the inbox composer.
          </p>
        </div>
        <div className="flex gap-2">
          <Can action={can('responseTemplates.add')}>
            <ImportButton />
            <Button onClick={() => setSheet({ open: true })}>
              <IconPlus />
              New template
            </Button>
          </Can>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          className="w-64"
          placeholder="Search name or content"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={channelId}
          onValueChange={(value) => {
            setChannelId(value);
            setPage(1);
          }}
        >
          <Select.Trigger className="w-56">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL}>All channels</Select.Item>
            {channelList?.map((channel) => (
              <Select.Item key={channel._id} value={channel._id}>
                {channel.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {(error || channels.error) && (
        <div className="flex items-center justify-between gap-2 rounded border border-destructive/30 p-3 text-sm">
          <span className="text-destructive">
            {(error ?? channels.error)?.message}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              channels.refetch();
            }}
          >
            Try again
          </Button>
        </div>
      )}

      {!data && !error && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {data?.list.length === 0 && (
        <Empty>
          <Empty.Header>
            <Empty.Media>
              <IconMessageReply />
            </Empty.Media>
            <Empty.Title>
              {searchValue || channelId !== ALL
                ? 'No templates match'
                : 'No response templates yet'}
            </Empty.Title>
            <Empty.Description>
              {searchValue || channelId !== ALL
                ? 'Try another search or channel.'
                : 'Create one, or import the ones frontline already has.'}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      )}

      {data && data.list.length > 0 && (
        <div className={loading ? 'opacity-50' : undefined}>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Content</Table.Head>
                <Table.Head>Channel</Table.Head>
                <Table.Head>
                  <span className="sr-only">Actions</span>
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.list.map((template) => (
                <Table.Row key={template._id}>
                  <Table.Cell className="font-medium">
                    {template.name}
                  </Table.Cell>
                  <Table.Cell className="max-w-md truncate text-muted-foreground">
                    {previewText(template.content)}
                  </Table.Cell>
                  <Table.Cell>{channelName(template.channelId)}</Table.Cell>
                  <Table.Cell className="w-24 text-right">
                    <Can action={can('responseTemplates.edit')}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                        onClick={() => setSheet({ open: true, template })}
                      >
                        <IconEdit />
                      </Button>
                    </Can>
                    <Can action={can('responseTemplates.remove')}>
                      <RemoveButton template={template} />
                    </Can>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {pageCount > 1 && (
            <div className="flex items-center justify-end gap-2 pt-3 text-sm text-muted-foreground">
              <span>
                Page {page} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pageCount}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <ResponseTemplateSheet
        open={sheet.open}
        onOpenChange={(open) => !open && setSheet({ open: false })}
        template={sheet.open ? sheet.template : undefined}
        channels={channelList ?? []}
        defaultChannelId={channelId === ALL ? undefined : channelId}
      />
    </div>
  );
};
