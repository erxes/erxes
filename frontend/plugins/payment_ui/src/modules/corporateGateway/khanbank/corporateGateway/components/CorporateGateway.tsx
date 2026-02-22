import { Card } from 'erxes-ui/components/card';
import List from '../../configs/containers/List';
import Detail from './Detail';

type Props = {
  queryParams: any;
  loading?: boolean;
};

const CorporateGateway = ({ queryParams, loading = false }: Props) => {
  const hasSelectedConfig = Boolean(queryParams._id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Khan Bank Corporate Gateway</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Corporate Gateway enables you to access banking services through
          erxes.
        </p>
      </div>

      {/* Layout */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-96">
          <List queryParams={queryParams} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {!hasSelectedConfig ? (
            <Card className="p-8 text-center space-y-4">
              <h3 className="text-lg font-semibold">
                Getting Started with Khan Bank Corporate Gateway
              </h3>

              <p className="text-sm text-muted-foreground">
                Register at Khan Bank and become a customer to start using
                Corporate Gateway.
              </p>

              <a
                href="https://www.khanbank.com/en/corporate/product/429?activetab=2"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline text-sm"
              >
                Apply for Corporate Gateway
              </a>
            </Card>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <Detail queryParams={queryParams} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateGateway;
