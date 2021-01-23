import CountsByTag from 'modules/common/components/CountsByTag';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
// import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import { ITag } from 'modules/tags/types';
import React from 'react';
// import { Link } from 'react-router-dom';
// import { MESSAGE_KIND_FILTERS, statusFilters } from '../constants';

// const { Section } = Wrapper.Sidebar;

type Props = {
  tagCounts: any;
  tags: ITag[];
};

class Sidebar extends React.Component<Props> {
  render() {
    const { tags, tagCounts } = this.props;
    console.log('tagCounts: ', tagCounts);
    return (
      <Wrapper.Sidebar>
        <CountsByTag
          tags={tags}
          manageUrl={'tags/integration'}
          counts={tagCounts}
          loading={false}
        />
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
