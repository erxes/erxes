import { useQueryState } from 'erxes-ui/hooks/use-query-state';
import { Empty } from 'erxes-ui';

import List from '../configs/containers/List';
import Detail from './Detail';

type Props = {
  loading?: boolean;
};

const CorporateGateway = ({ loading = false }: Props) => {
  const [configId] = useQueryState<string>('_id');

  const hasSelection = Boolean(configId);

  return (
    <div className="flex h-full w-full">
      {/* LEFT SIDEBAR */}
      <List loading={loading} />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto p-4">
        {hasSelection ? (
          <Detail />
        ) : (
          <Empty>
            <Empty.Header>
              <Empty.Title>
                Getting Started with GolomtBank Corporate Gateway
              </Empty.Title>
              <Empty.Description>
                Corporate Gateway enables you to access banking services through
                erxes.
              </Empty.Description>
            </Empty.Header>

            <Empty.Content>
              <a
                href="https://www.golomtBank.com/en/corporate/product/429?activetab=2"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-4"
              >
                Apply for Corporate Gateway
              </a>
            </Empty.Content>
          </Empty>
        )}
      </div>
    </div>
  );
};

export default CorporateGateway;
