import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import Sidebar from 'modules/layout/components/Sidebar';
import { SidebarList, TagsButtons } from 'modules/layout/styles';
import Tagger from 'modules/tags/containers/Tagger';
import React from 'react';
import { Collapse } from 'react-bootstrap';

type Props = {
  data: any;
  type: string;
  refetchQueries?: any[];
  toggle?: any;
  isOpen?: boolean;
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

    const { isTaggerVisible } = this.state;

    this.setState({ isTaggerVisible: !isTaggerVisible });
  };

  renderTags(tags) {
    if (!tags.length) {
      return <EmptyState icon="tag" text="Not tagged yet" size="small" />;
    }

    return (
      <SidebarList className="no-link">
        {tags.map(({ _id, colorCode, name }) => (
          <li key={_id}>
            <Icon icon="tag icon" style={{ color: colorCode }} />
            {name}
          </li>
        ))}
      </SidebarList>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { QuickButtons } = Section;

    const { data, type, refetchQueries } = this.props;
    const tags = data.getTags || [];

    const quickButtons = (
      <a href="#settings" tabIndex={0} onClick={this.toggleTagger}>
        <Icon icon="settings" />
      </a>
    );

    const extraButtons = <QuickButtons>{quickButtons}</QuickButtons>;

    return (
      <Section>
        <TagsButtons>{extraButtons}</TagsButtons>
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
      </Section>
    );
  }
}

export default TaggerSection;
