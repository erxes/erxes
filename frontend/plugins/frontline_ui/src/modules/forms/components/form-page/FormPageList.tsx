import { useFormsList } from "@/forms/hooks/useFormsList";
import { Button, Empty, RecordTable, useMultiQueryState } from "erxes-ui";
import { formColumns } from "./form-columns";
import { ColumnDef } from "@tanstack/table-core";
import { IForm } from "@/forms/types/formTypes";
import { FormCommandBar } from "./command-bar/form-command-bar";
import { IconForms, IconSettings } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export const FormPageList = () => {
  const [{ channelId, tagId, status, searchValue }] = useMultiQueryState<{
    channelId?: string;
    tagId?: string;
    status?: string;
    searchValue?: string;
  }>(['tagId', 'status', 'searchValue', 'channelId']);
  const { forms, loading, handleFetchMore, pageInfo } = useFormsList({
    variables: {
      channelId: channelId || undefined,
      tagId: tagId || '',
      status: status || '',
      searchValue: searchValue || '',
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (forms?.length === 0) {
    return (
      <Empty className='bg-sidebar rounded-lg m-3'>
        <Empty.Header>
          <Empty.Media>
            <IconForms />
          </Empty.Media>
          <Empty.Title>No forms found</Empty.Title>
          <Empty.Description>Create a form to get started</Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button variant={'outline'} asChild>
            <Link to='/settings/frontline/channels'>
              <IconSettings />
              Go to channels
            </Link>
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={formColumns as unknown as ColumnDef<IForm>[]}
      data={forms || []}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={forms?.length}
        sessionKey={'forms_cursor'}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <FormCommandBar />
    </RecordTable.Provider>
  );
};
