import * as routerUtils from '@erxes/ui/src/utils/router';

import { useLocation, useNavigate } from 'react-router-dom';

import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import LoadMore from '@erxes/ui/src/components/LoadMore';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { TopHeader } from '@erxes/ui/src/styles/main';
import React from 'react';
import { ConfigList } from '../../../styles';
import Form from '../../configs/containers/Form';
import { IKhanbankConfigsItem } from '../../configs/types';
import AccountList from '../accounts/containers/List';

type Props = {
  configs: IKhanbankConfigsItem[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  refetch?: () => void;
};

const ConfigsList = (props: Props) => {
  const { configs, totalCount, queryParams, loading, refetch } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const [currentConfig, setCurrentConfig] = React.useState<string | undefined>(
    queryParams._id
  );

  const [fetchPolicy, setFetchPolicy] = React.useState('cache-first');

  React.useEffect(() => {
    const defaultAccount = JSON.parse(
      localStorage.getItem('khanbankDefaultAccount') || '{}'
    );

    if (defaultAccount.configId && defaultAccount.accountNumber) {
      routerUtils.setParams(navigate, location, {
        _id: defaultAccount.configId,
        account: defaultAccount.accountNumber,
      });
    }
  }, []);

  const onClickRow = (config) => {
    setCurrentConfig(config._id);
    routerUtils.setParams(navigate, location, { _id: config._id });
  };

  const onRefresh = () => {
    setFetchPolicy('network-only');
  };

  const reload = (
    <a href='#refresh' onClick={onRefresh} tabIndex={0}>
      <Icon icon='refresh' size={8} />
    </a>
  );

  const renderRow = () => {


   return configs.map((config) => (
      <Box
        key={config._id}
        extraButtons={reload}
        title={config.name}
        name={config._id}
        collapsible={false}
        callback={() => {
          onClickRow(config);
        }}
      >
        <AccountList
          {...props}
          configId={config._id}
          fetchPolicy={fetchPolicy}
        />
      </Box>
    ));
  };

  const renderSidebarHeader = () => {
    const addConfig = (
      <Button
        btnStyle='success'
        block={true}
        uppercase={false}
        icon='plus-circle'
      >
        Add New Config
      </Button>
    );

    const formContent = (formProps) => <Form {...formProps} />;

    return (
      <TopHeader>
        <ModalTrigger
          size='sm'
          title='Corporate Gateway'
          trigger={addConfig}
          enforceFocus={false}
          content={formContent}
        />
      </TopHeader>
    );
  };

  return (
    <ConfigList>
      <LeftSidebar wide={true} header={renderSidebarHeader()} hasBorder={true}>
      
          <SidebarList
            $noTextColor={true}
            $noBackground={false}
            id={'khanbankSidebar'}
          >
            {renderRow()}
            <LoadMore all={totalCount} loading={loading} />
          </SidebarList>
          {!loading && totalCount === 0 && (
            <EmptyState
              image='/images/actions/18.svg'
              text='There is no config yet. Start by adding one.'
            />
          )}
   
      </LeftSidebar>
    </ConfigList>
  );
};

export default ConfigsList;
