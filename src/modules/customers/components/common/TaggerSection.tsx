import { EmptyState, Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';
import { Tagger } from 'modules/tags/containers';
import * as React from 'react';
import { Collapse } from 'react-bootstrap';

type Props = {
  data: any;
  type: string;
  refetchQueries?: any[];
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

    this.toggleTagger = this.toggleTagger.bind(this);
  }

  toggleTagger(e) {
    e.preventDefault();

    const { isTaggerVisible } = this.state;

    this.setState({ isTaggerVisible: !isTaggerVisible });
  }

  renderTags(tags) {
    if (!tags.length) {
      return <EmptyState icon="tag" text="Not tagged yet" size="small" />;
    }

    return tags.map(({ _id, colorCode, name }) => (
      <li key={_id}>
        <Icon icon="tag icon" style={{ color: colorCode }} />
        {name}
      </li>
    ));
  }

  render() {
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;

    const { data, type, refetchQueries } = this.props;
    const tags = data.getTags || [];

    const quickButtons = (
      <a tabIndex={0} onClick={this.toggleTagger}>
        <Icon icon="settings" />
      </a>
    );

    return (
      <Section>
        <Title>{__('Tags')}</Title>

        <QuickButtons>{quickButtons}</QuickButtons>

        <Collapse in={this.state.isTaggerVisible}>
          <div>
            <Tagger
              type={type}
              targets={[data]}
              className="sidebar-accordion"
              event="onClick"
              refetchQueries={refetchQueries}
            />
          </div>
        </Collapse>

        <SidebarList className="no-link">{this.renderTags(tags)}</SidebarList>
      </Section>
    );
  }
}

export default TaggerSection;
