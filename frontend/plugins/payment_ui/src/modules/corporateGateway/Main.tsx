import { useTranslation } from 'react-i18next';
import { IconSearch } from '@tabler/icons-react';
import { Input, PageSubHeader, useQueryState } from 'erxes-ui';
import { GatewayTotalCount } from './components/GatewayTotalCount';
import { GatewayGlobalCommandBar } from './components/GatewayGlobalCommandBar';
import { GolomtSection } from './golomtbank/settings/GolomtSection';
import { KhanbankSection } from './khanbank/settings/KhanbankSection';
import { TdbSection } from './tdb/settings/TdbSection';

const CorporateGatewayMain = () => {
  const { t } = useTranslation('payment');
  const [searchValue, setSearchValue] = useQueryState<string>('searchValue');

  return (
    <>
      <PageSubHeader>
        <div className="relative w-64">
          <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder={t('filter-by-name')}
            value={searchValue || ''}
            onChange={(e) => setSearchValue(e.target.value || null)}
          />
        </div>
        <GatewayTotalCount />
      </PageSubHeader>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        <GolomtSection searchValue={searchValue || ''} />
        <KhanbankSection searchValue={searchValue || ''} />
        <TdbSection searchValue={searchValue || ''} />
      </div>
      <GatewayGlobalCommandBar />
    </>
  );
};

export default CorporateGatewayMain;
