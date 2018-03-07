import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-bootstrap';
import { Sidebar } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';
import { EmptyState, Tagger, Icon } from 'modules/common/components';

const propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired
};

class TaggerSection extends Component {
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
      return <EmptyState icon="pricetags" text="Not tagged yet" size="small" />;
    }

    return tags.map(({ _id, colorCode, name }) => (
      <li key={_id}>
        <Icon icon="pricetag icon" style={{ color: colorCode }} />
        {name}
      </li>
    ));
  }

  render() {
    const { data, type } = this.props;
    const tags = data.getTags || [];
    const { Title, QuickButtons } = Sidebar.Section;
    const { __ } = this.context;
    return (
      <Sidebar.Section>
        <Title>{__('Tags')}</Title>

        <QuickButtons>
          <a tabIndex={0} onClick={this.toggleTagger}>
            <Icon icon="gear-a" />
          </a>
        </QuickButtons>

        <Collapse in={this.state.isTaggerVisible}>
          <div>
            <Tagger
              type={type}
              targets={[data]}
              className="sidebar-accordion"
              event="onClick"
            />
          </div>
        </Collapse>

        <SidebarList className="no-link">{this.renderTags(tags)}</SidebarList>
      </Sidebar.Section>
    );
  }
}

TaggerSection.propTypes = propTypes;
TaggerSection.contextTypes = {
  __: PropTypes.func
};

export default TaggerSection;
