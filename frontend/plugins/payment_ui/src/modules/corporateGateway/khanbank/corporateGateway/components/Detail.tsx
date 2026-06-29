import { useState } from 'react';
import { Tabs } from 'erxes-ui/components/tabs';
import { Card } from 'erxes-ui/components/card';

import DetailContainer from '../accounts/containers/Detail';
import TransactionsContainer from '../transactions/containers/List';

type Props = {
  loading?: boolean;
  queryParams: any;
};

const Detail = ({ queryParams }: Props) => {
  const [currentTab, setCurrentTab] = useState<string>('account');

  const hasConfig = Boolean(queryParams._id);
  const hasAccount = Boolean(queryParams.account);

  if (!hasConfig) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Please select a corporate gateway configuration.
      </Card>
    );
  }

  if (!hasAccount) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Please select an account.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <DetailContainer queryParams={queryParams} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsContainer queryParams={queryParams} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Detail;
