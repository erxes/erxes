import {
  Button,
  DataWithLoader,
  HeaderDescription,
  ModalTrigger,
  Pagination,
  Table,
} from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Form from './SyncRuleForm';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
// import Sidebar from './Sidebar';
import { ISyncRule } from '../types';
import { Title } from '@erxes/ui-settings/src/styles';
import Row from './SyncRuleRow';

type Props = {
  syncRulesCount: number;
  syncRules: ISyncRule[];
  loading: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (brandId: string) => void;
};

const SyncRules: React.FC<Props> = (props) => {
  const { syncRules, renderButton, remove, syncRulesCount, loading } = props;
  const renderContent = () => {
    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>{__('Title')}</th>
              <th>{__('Service Name')}</th>
              <th>{__('Response key')}</th>
              <th>{__('Extract Type')}</th>
              <th>{__('Extract key')}</th>
              <th>{__('Object Type')}</th>
              <th>{__('Field Group')}</th>
              <th>{__('Field')}</th>
            </tr>
          </thead>
          <tbody>
            {syncRules.map((syncRule) => {
              return (
                <Row
                  key={syncRule._id}
                  syncRule={syncRule}
                  renderButton={renderButton}
                  remove={remove}
                />
              );
            })}
          </tbody>
        </Table>
        <Pagination count={10} />
      </>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('SyncRules'), link: '/settings/syncRules-manage' },
  ];

  const addRule = (
    <Button
      id={'NewSyncRuleButton'}
      btnStyle="success"
      block={true}
      icon="plus-circle"
    >
      Add Sync Rule
    </Button>
  );

  const content = (props) => (
    <Form {...props} extended={true} renderButton={renderButton} />
  );

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title={__("New Sync Rule")}
      autoOpenKey="showSyncRuleAddModal"
      trigger={addRule}
      content={content}
    />
  );

  const leftActionBar = <Title>{`All sync rules (${syncRulesCount})`}</Title>;

  return (
    <Wrapper
      header={<Wrapper.Header title={`Sync Rule`} breadcrumb={breadcrumb} />}
      mainHead={
        <HeaderDescription
          icon="/images/actions/32.svg"
          title={__('Sync Rule')}
          description={__('Add sync rule ...')}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          right={righActionBar}
          wideSpacing={true}
          left={leftActionBar}
        />
      }
      // leftSidebar={<Sidebar />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={syncRulesCount}
          emptyText="Add an Sync Rule"
          emptyImage="/images/actions/2.svg"
        />
      }
      footer={syncRulesCount > 0 && <Pagination count={syncRulesCount} />}
      hasBorder={true}
    />
  );
};

export default SyncRules;
