import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import Row from '../containers/categories/Row';
import CategoryForm from './CategoryForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  forumCategories: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

export default function LayoutCategories({
  forumCategories,
  renderButton
}: Props) {
  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Categories'), link: '/forums/categories' }
  ];

  const trigger = (
    <Button id={'AddCategoryButton'} btnStyle="success" icon="plus-circle">
      Add Category
    </Button>
  );

  const modalContent = props => (
    <CategoryForm {...props} renderButton={renderButton} />
  );

  const actionBarRight = (
    <ModalTrigger
      title={__('Add category')}
      autoOpenKey={`showForumCategoriesModal`}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={<Title capitalize={true}>{__('Categories')}</Title>}
      right={actionBarRight}
    />
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
        {forumCategories.map((cat: any) => {
          return <Row key={cat._id} category={cat} />;
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
          emptyText={__('There is no categories') + '.'}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}
