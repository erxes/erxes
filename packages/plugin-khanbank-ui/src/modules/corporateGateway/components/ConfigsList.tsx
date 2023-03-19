import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import LoadMore from '@erxes/ui/src/components/LoadMore';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Spinner from '@erxes/ui/src/components/Spinner';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { TopHeader } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import * as routerUtils from '@erxes/ui/src/utils/router';
import React from 'react';
import { withRouter } from 'react-router-dom';

import { ConfigList } from '../../../styles';
import AccountList from '../accounts/containers/List';
import Form from '../../configs/containers/Form';
import { IKhanbankConfigsItem } from '../../configs/types';

type Props = {
  configs: IKhanbankConfigsItem[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  refetch?: () => void;
} & IRouterProps;

const ConfigsList = (props: Props) => {
  const { configs, totalCount, queryParams, loading, history, refetch } = props;

  const [currentConfig, setCurrentConfig] = React.useState<string | undefined>(
    queryParams._id
  );

  const [fetchPolicy, setFetchPolicy] = React.useState('cache-first');

  React.useEffect(() => {
    const defaultAccount = JSON.parse(
      localStorage.getItem('khanbankDefaultAccount') || '{}'
    );

    if (defaultAccount.configId && defaultAccount.accountNumber) {
      routerUtils.setParams(history, {
        _id: defaultAccount.configId,
        account: defaultAccount.accountNumber
      });
    }
  }, []);

  const onClickRow = config => {
    setCurrentConfig(config._id);
    routerUtils.setParams(history, { _id: config._id });
  };

  const onRefresh = () => {
    setFetchPolicy('network-only');
  };

  const reload = (
    <a href="#refresh" onClick={onRefresh} tabIndex={0}>
      <Icon icon="refresh" size={8} />
    </a>
  );

  const renderRow = () => {
    return configs.map((config, index) => {
      return (
        <Box
          key={index}
          extraButtons={reload}
          title={config.name}
          isOpen={currentConfig === config._id}
          name={config._id}
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
      );
    });
  };

  const renderSidebarHeader = () => {
    const addConfig = (
      <Button
        btnStyle="success"
        block={true}
        uppercase={false}
        icon="plus-circle"
      >
        Add New Config
      </Button>
    );

    const formContent = formProps => <Form {...formProps} />;

    return (
      <TopHeader>
        <ModalTrigger
          size="sm"
          title="Corporate Gateway"
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
          noTextColor={true}
          noBackground={true}
          id={'khanbankSidebar'}
        >
          {renderRow()}
          <LoadMore all={totalCount} loading={loading} />
        </SidebarList>
        {!loading && totalCount === 0 && (
          <EmptyState
            image="/images/actions/18.svg"
            text="There is no config yet. Start by adding one."
          />
        )}
      </LeftSidebar>
    </ConfigList>
  );
};

export default withRouter<Props>(ConfigsList);
