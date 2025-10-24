import { Button, PageContainer } from 'erxes-ui';

import { SettingsList } from '@/loyalty/components/SettingList';
import { IconSandbox } from '@tabler/icons-react';

import { SettingsHeader } from 'ui-modules';
import { VoucherCampaignRecordTable } from '~/modules/loyalty/sections/voucher/components/PosRecordTable';

const Settings = () => {
  return (
    <PageContainer className="flex-row">
      <SettingsList />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <SettingsHeader breadcrumbs={[]}>
          <Button variant="ghost" className="font-semibold">
            <IconSandbox className="w-4 h-4 text-accent-foreground" />
            Items
          </Button>
        </SettingsHeader>
        <div className="flex flex-auto w-full overflow-hidden">
          <div className="w-full overflow-hidden flex flex-col">
            <VoucherCampaignRecordTable />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;
