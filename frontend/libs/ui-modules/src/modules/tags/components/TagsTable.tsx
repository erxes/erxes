import { Table, ListCard } from 'erxes-ui';

export const TagsTable = () => {
  return (
    <div className="overflow-auto h-full px-8">
      <ListCard>
        <ListCard.Header>
          <ListCard.Head className=" ">Name</ListCard.Head>
          <ListCard.Head className="w-20">Description</ListCard.Head>
          <ListCard.Head className="w-32">Created At</ListCard.Head>
        </ListCard.Header>
        <ListCard.Content className="">
          <Table className="rounded-tl-lg border-none">
            <Table.Header className="sr-only">
              Name, Description, Created At
            </Table.Header>
            <Table.Body className="rounded-lg overflow-hidden *:[tr]:first:*:[td]:first:rounded-ss-lg *:[tr]:last:*:[td]:last:rounded-ee-lg *:[tr]:first:*:[td]:last:rounded-se-lg ">
              <Table.Row>
                <Table.Cell className="border-none">tessadsdfsdf </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </ListCard.Content>
      </ListCard>
    </div>
  );
};
