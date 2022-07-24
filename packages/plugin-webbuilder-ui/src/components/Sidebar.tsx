import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { __ } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import React from 'react';
import { Link } from 'react-router-dom';

const { Section } = Wrapper.Sidebar;

type Props = {
  history: any;
  queryParams: any;
  type: string;
  contentTypes: any;
};

class List extends React.Component<Props> {
  private space = '\u00a0\u00a0'.repeat(2);

  isActive = (link: string) => {
    const { type } = this.props;

    return type === link;
  };

  renderContent() {
    const result: React.ReactNode[] = [];

    const types = [
      {
        _id: '33',
        link: 'pages',
        name: 'Pages'
      },
      {
        _id: '22',
        link: 'contenttypes',
        name: 'Content types'
      }
    ] as any;

    for (const type of types) {
      result.push(
        <SidebarListItem
          key={Math.random()}
          isActive={this.isActive(type.link)}
        >
          <Link to={`/webbuilder/${type.link}`}>
            {this.space}
            <span>{type.name}</span>
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
          const { entries = [] } = contentType;

          return (
            <SidebarListItem
              key={contentType._id}
              isActive={this.isTypeActive(contentType._id)}
            >
              <Link
                to={`/webbuilder/entries/?contentTypeId=${contentType._id}`}
              >
                {this.space}
                <span>
                  {contentType.displayName} ({entries.length})
                </span>
              </Link>
            </SidebarListItem>
          );
        })}
      </>
    );
  }

  renderTypeList() {
    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={false}
          count={10}
          emptyText="There is web builder"
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
          {this.renderTypeList()}
          {this.renderEntries()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;
