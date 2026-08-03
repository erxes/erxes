import { useTranslation } from 'react-i18next';
import {
  Combobox,
  Filter,
  Input,
  PageSubHeader,
  useQueryState,
} from 'erxes-ui';
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
      <Filter id="corporate-gateway">
        <PageSubHeader>
          <Filter.Bar>
            <Filter.Popover scope="corporate-gateway-page">
              <Filter.Trigger isFiltered={!!searchValue} />
              <Combobox.Content>
                <div className="p-3">
                  <Input
                    autoFocus
                    placeholder={t('filter-by-name')}
                    value={searchValue || ''}
                    onChange={(e) => setSearchValue(e.target.value || null)}
                  />
                </div>
              </Combobox.Content>
            </Filter.Popover>
            <GatewayTotalCount />
          </Filter.Bar>
        </PageSubHeader>
      </Filter>

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
