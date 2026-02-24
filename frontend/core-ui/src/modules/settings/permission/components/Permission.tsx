import { PageSubHeader } from 'erxes-ui';
import { Permissions } from 'ui-modules';

const Permission = () => {
  return (
    <div className="w-full overflow-hidden flex flex-col">
      <PageSubHeader>
        <Permissions.Filter shouldHide={false} />
      </PageSubHeader>
      <Permissions.RecordTable />
    </div>
  );
};

export { Permission };
