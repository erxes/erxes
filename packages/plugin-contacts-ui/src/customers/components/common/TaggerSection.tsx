import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import Tagger from '@erxes/ui/src/tags/containers/Tagger';
import React from 'react';
import Collapse from 'react-bootstrap/Collapse';

type Props = {
  data: any;
  type: string;
  refetchQueries?: any[];
  collapseCallback?: () => void;
};

type State = {
  isTaggerVisible: boolean;
};

class TaggerSection extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isTaggerVisible: false
    };
  }

  toggleTagger = e => {
    e.preventDefault();

    this.setState({ isTaggerVisible: !this.state.isTaggerVisible });
  };

  renderTags(tags) {
    if (!tags.length) {
      return <EmptyState icon="tag-alt" text="Not tagged yet" size="small" />;
    }

    return (
      <SidebarList className="no-link">
        {tags.map(({ _id, colorCode, name }) => (
          <li key={_id}>
            <Icon icon="tag-alt" style={{ color: colorCode }} />
            {name}
          </li>
        ))}
      </SidebarList>
    );
  }

  render() {
    const { data, type, refetchQueries, collapseCallback } = this.props;
    const tags = data.getTags || [];

    const extraButtons = (
      <a href="#settings" tabIndex={0} onClick={this.toggleTagger}>
        <Icon icon="cog" />
      </a>
    );

    return (
      <Box
        title={__('Tags')}
        name="showTags"
        extraButtons={extraButtons}
        callback={collapseCallback}
      >
        <Collapse in={this.state.isTaggerVisible}>
          <Tagger
            type={type}
            targets={[data]}
            className="sidebar-accordion"
            event="onClick"
            refetchQueries={refetchQueries}
          />
        </Collapse>
        {this.renderTags(tags)}
      </Box>
    );
  }
}

export default TaggerSection;
