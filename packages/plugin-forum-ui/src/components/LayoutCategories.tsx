import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import Row from '../containers/Categories/Row';
import CategoryForm from './CategoryForm';

type Props = {
  forumCategories: [];
  onSubmit?: (val: any) => any;
};

export default function LayoutCategories({ forumCategories, onSubmit }: Props) {
  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Categories'), link: '/forums/categories' }
  ];

  const trigger = (
    <Button id={'AddCategoryButton'} btnStyle="success" icon="plus-circle">
      Add Root Category
    </Button>
  );

  const modalContent = () => (
    <CategoryForm noParent={true} onSubmit={onSubmit} />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add root category')}
      autoOpenKey={`showForumCategoriesModal`}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar left={'Categories'} right={actionBarRight} />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Code')}</th>
          <th>{__('Post Counts')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'ForumCategoriesList'}>
        {forumCategories.map(cat => {
          return <Row key={cat} category={cat} />;
        })}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Categories')} breadcrumb={breadcrumb} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          count={forumCategories.length}
          emptyText={__('There is no tag') + '.'}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}
