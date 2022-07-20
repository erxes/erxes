import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { __, router } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@erxes/ui-settings/src/styles';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  loading: boolean;
  contentTypes: any;
}

class List extends React.Component<IProps> {
  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams.contentTypeId || '';

    return currentGroup === id;
  };

  renderContent() {
    const { contentTypes } = this.props;

    const result: React.ReactNode[] = [];

    for (const contentType of contentTypes) {
      const name = `${contentType.displayName}`;

      result.push(
        <SidebarListItem
          key={contentType._id}
          isActive={this.isActive(contentType._id)}
        >
          <Link to={`?contentTypeId=${contentType._id}`}>{name}</Link>
        </SidebarListItem>
      );
    }

    console.log(result, 'hahahhahahahaha');

    return result;
  }

  // renderCategoryHeader() {
  //   const trigger = (
  //     <Button btnStyle="success" icon="plus-circle" block={true}>
  //       Add category
  //     </Button>
  //   );

  //   return (
  //     <>
  //       <Header>{this.renderFormTrigger(trigger)}</Header>
  //       <Section.Title noBackground noSpacing>
  //         {__('Categories')}

  //         <Section.QuickButtons>
  //           {router.getParam(this.props.history, 'categoryId') && (
  //             <a href="#cancel" tabIndex={0} onClick={this.clearCategoryFilter}>
  //               <Tip text={__('Clear filter')} placement="bottom">
  //                 <Icon icon="cancel-1" />
  //               </Tip>
  //             </a>
  //           )}
  //         </Section.QuickButtons>
  //       </Section.Title>
  //     </>
  //   );
  // }

  renderCategoryList() {
    const { loading, contentTypes } = this.props;

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={contentTypes.length}
          emptyText="There is no product & service category"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  render() {
    return (
      <Sidebar wide={true} hasBorder={true} noMargin={true}>
        <Section maxHeight={488} noShadow={true} noMargin={true}>
          {/* {this.renderCategoryHeader()} */}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;
