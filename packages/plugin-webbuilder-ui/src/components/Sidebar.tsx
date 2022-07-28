import { __ } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { ITEMS } from '../constants';
import { IContentTypeDoc } from '../types';

const { Section } = Wrapper.Sidebar;

type Props = {
  history: any;
  queryParams: any;
  type: string;
  contentTypes: IContentTypeDoc[];
};

class List extends React.Component<Props> {
  private space = '\u00a0\u00a0'.repeat(2);

  isActive = (link: string) => {
    const { type } = this.props;

    return type === link;
  };

  renderContent() {
    const result: React.ReactNode[] = [];

    for (const item of ITEMS.ALL) {
      result.push(
        <SidebarListItem key={item.link} isActive={this.isActive(item.link)}>
          <Link to={`/webbuilder/${item.link}`}>
            {this.space}
            <span>{item.name}</span>
          </Link>
        </SidebarListItem>
      );
    }

    return (
      <>
        <Section.Title noBackground={true} noSpacing={true}>
          {__('Builder')}
        </Section.Title>

        {result}
      </>
    );
  }

  isTypeActive = (_id: string) => {
    const { queryParams } = this.props;

    const contentTypeId = queryParams.contentTypeId;

    return contentTypeId === _id;
  };

  renderEntries() {
    const { contentTypes } = this.props;

    return (
      <>
        <Section.Title noBackground={true} noSpacing={true}>
          {__('Entries')}
        </Section.Title>

        {contentTypes.map(contentType => {
          return (
            <SidebarListItem
              key={contentType._id}
              isActive={this.isTypeActive(contentType._id)}
            >
              <Link
                to={`/webbuilder/entries/?contentTypeId=${contentType._id}`}
              >
                {this.space}
                <span>{contentType.displayName}</span>
              </Link>
            </SidebarListItem>
          );
        })}
      </>
    );
  }

  render() {
    const { contentTypes } = this.props;

    return (
      <Sidebar wide={true} hasBorder={true} noMargin={true}>
        <Section
          maxHeight={488}
          noShadow={true}
          noMargin={true}
          collapsible={contentTypes.length > 9}
        >
          {this.renderContent()}
          {this.renderEntries()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;
