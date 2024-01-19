import { __ } from '@erxes/ui/src/utils';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { Title } from '@erxes/ui/src/styles/main';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IItem } from '@erxes/ui-products/src/types';
import Table from '@erxes/ui/src/components/table';
import FormControl from '@erxes/ui/src/components/form/Control';
import Row from './Row';

type Props = {
  history: any;
  queryParams: any;
  items: IItem[];
  itemsCount: number;
};

class List extends React.Component<Props> {
  renderRow = () => {
    const { items, history } = this.props;

    return items.map((item) => (
      <Row history={history} key={item._id} item={item} />
    ));
  };

  renderContent = () => {
    return (
      <>
        {' '}
        <Table hover={true}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>
                <FormControl componentClass="checkbox" />
              </th>
              <th>{__('Name')}</th>
              <th>{__('Code')}</th>
              <th>{__('Description')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRow()}</tbody>
        </Table>
      </>
    );
  };

  render() {
    const { itemsCount } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Items') },
    ];

    const actionBarRight = () => {
      return <>action bar right</>;
    };

    const actionBarLeft = <Title>{`${'All items'} (${itemsCount})`}</Title>;

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Items')} breadcrumb={breadcrumb} />}
        mainHead={
          <HeaderDescription
            icon="/images/actions/30.svg"
            title={'Items'}
            description={`${__(
              'All information and know-how related to your business items are found here',
            )}.${__(
              'Create and add in unlimited items so that you and your team members can edit and share',
            )}`}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight()} />
        }
        footer={<Pagination count={itemsCount} />}
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default List;
