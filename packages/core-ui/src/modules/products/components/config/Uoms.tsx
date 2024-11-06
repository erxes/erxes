import {
  Button,
  DataWithLoader,
  HeaderDescription,
  ModalTrigger,
  Pagination,
  Table,
} from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Form from './UomsForm';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Sidebar from './Sidebar';
import { IUom } from '../../types';
import Row from './Row';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  uomsTotalCount: number;
  uoms: IUom[];
  loading: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (brandId: string) => void;
};

const Uoms: React.FC<Props> = (props) => {
  const { uoms, renderButton, remove, uomsTotalCount, loading } = props;
  const renderContent = () => {
    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>{__('code')}</th>
              <th>{__('Name')}</th>
              <th>{__('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {uoms.map((uom) => {
              return (
                <Row
                  key={uom._id}
                  uom={uom}
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
    { title: __('Uoms'), link: '/settings/uoms-manage' },
  ];

  const addBrand = (
    <Button
      id={'NewUomButton'}
      btnStyle="success"
      block={true}
      icon="plus-circle"
    >
      Add Uom
    </Button>
  );

  const content = (props) => (
    <Form {...props} extended={true} renderButton={renderButton} />
  );

  const righActionBar = (
    <ModalTrigger
      size="lg"
      title="New Uom"
      autoOpenKey="showUomAddModal"
      trigger={addBrand}
      content={content}
    />
  );

  const leftActionBar = <Title>{`All Uoms (${uomsTotalCount})`}</Title>;

  return (
    <Wrapper
      header={<Wrapper.Header title={`Uom`} breadcrumb={breadcrumb} />}
      mainHead={
        <HeaderDescription
          icon="/images/actions/32.svg"
          title={'Uoms'}
          description={__('Add uoms ...')}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          right={righActionBar}
          wideSpacing={true}
          left={leftActionBar}
        />
      }
      leftSidebar={<Sidebar />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={uomsTotalCount}
          emptyText="Add an integration in this Uom"
          emptyImage="/images/actions/2.svg"
        />
      }
      footer={uomsTotalCount > 0 && <Pagination count={uomsTotalCount} />}
      hasBorder={true}
    />
  );
};

export default Uoms;
