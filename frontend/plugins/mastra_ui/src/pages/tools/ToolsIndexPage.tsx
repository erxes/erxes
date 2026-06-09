import { useState } from 'react';
import { IconPlus, IconTool, IconPencil, IconTrash, IconRefresh } from '@tabler/icons-react';
import { useQuery, useMutation } from '@apollo/client';
import {
  AlertDialog,
  Badge,
  Breadcrumb,
  Button,
  Empty,
  Separator,
  Skeleton,
  Table,
  Tooltip,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { MASTRA_TOOLS } from '~/graphql/queries';
import { MASTRA_TOOL_REMOVE, MASTRA_AUTO_CREATE_TOOLS } from '~/graphql/mutations';

const ToolRow = ({ tool, onRemove }: { tool: any; onRemove: (t: any) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <Table.Row>
      <Table.Cell className="px-3 py-2">
        <div className="font-medium text-sm">{tool.name}</div>
        <div className="font-mono text-xs text-muted-foreground mt-0.5">{tool.toolId}</div>
      </Table.Cell>
      <Table.Cell className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Badge variant={tool.type === 'builtin' ? 'default' : 'secondary'} className="capitalize">
            {tool.type}
          </Badge>
          {!tool.isEnabled && <Badge variant="destructive">Disabled</Badge>}
        </div>
      </Table.Cell>
      <Table.Cell className="px-3 py-2">
        {tool.type === 'erxes' ? (
          <div>
            <span className="text-xs text-muted-foreground">{tool.erxesPlugin}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xs px-1.5 py-0.5 rounded-sm font-mono ${
                tool.erxesOperationType === 'mutation'
                  ? 'bg-warning/10 text-warning'
                  : 'bg-info/10 text-info'
              }`}>
                {tool.erxesOperationType}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{tool.erxesOperation}</span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{tool.builtinType || '—'}</span>
        )}
      </Table.Cell>
      <Table.Cell className="px-3 py-2">
        {tool.description ? (
          <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </Table.Cell>
      <Table.Cell className="px-3 py-2">
        <div className="flex items-center gap-1">
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button variant="ghost" size="icon" className="size-7" asChild>
                  <Link to={`/settings/mastra/tools/edit/${tool._id}`}>
                    <IconPencil className="size-3.5" />
                  </Link>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Edit</Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger asChild>
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive">
                      <IconTrash className="size-3.5" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Delete</Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Delete tool</AlertDialog.Title>
                <AlertDialog.Description>
                  Remove <strong>{tool.name}</strong>? Agents using this tool will lose access to it.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onRemove(tool)}
                >
                  Delete
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>
        </div>
      </Table.Cell>
    </Table.Row>
  );
};

export const ToolsIndexPage = () => {
  const { data, loading, refetch } = useQuery(MASTRA_TOOLS);
  const [removeTool] = useMutation(MASTRA_TOOL_REMOVE, { onCompleted: () => refetch() });
  const [autoCreate, { loading: autoCreating }] = useMutation(MASTRA_AUTO_CREATE_TOOLS, {
    onCompleted: (res) => {
      const r = res?.mastraAutoCreateTools;
      if (r) alert(`Done — created: ${r.created}, skipped: ${r.skipped}, total discovered: ${r.total}`);
      refetch();
    },
    onError: (err) => alert(`Auto-create failed: ${err.message}`),
  });

  const tools = data?.mastraTools || [];
  const handleRemove = (tool: any) => removeTool({ variables: { _id: tool._id } });

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/mastra/tools">
                    <IconTool />
                    Tools
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  variant="outline"
                  onClick={() => autoCreate()}
                  disabled={autoCreating}
                >
                  <IconRefresh className={autoCreating ? 'animate-spin' : ''} />
                  {autoCreating ? 'Creating…' : 'Auto-create from erxes'}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                Discovers all erxes GraphQL queries &amp; mutations and creates a tool for each one (skips ClientPortal and duplicates).
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
          <Button asChild>
            <Link to="/settings/mastra/tools/new">
              <IconPlus /> New Tool
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <Empty className="border border-dashed">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconTool />
              </Empty.Media>
              <Empty.Title>No tools yet</Empty.Title>
              <Empty.Description>
                Add built-in tools (web search, calculator) or wrap any erxes GraphQL operation.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button asChild>
                <Link to="/settings/mastra/tools/new">
                  <IconPlus /> Add Tool
                </Link>
              </Button>
            </Empty.Content>
          </Empty>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row className="hover:bg-transparent">
                <Table.Head className="px-3 w-1/4">Tool</Table.Head>
                <Table.Head className="px-3 w-1/8">Type</Table.Head>
                <Table.Head className="px-3 w-1/4">Operation</Table.Head>
                <Table.Head className="px-3">Description</Table.Head>
                <Table.Head className="px-3 w-24">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tools.map((tool: any) => (
                <ToolRow key={tool._id} tool={tool} onRemove={handleRemove} />
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};
