import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { QuickButton, SidebarList } from 'modules/layout/styles';
import { EmptyState, Tagger, Icon } from 'modules/common/components';

const propTypes = {
  customer: PropTypes.object.isRequired
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
        <Icon icon="icon pricetag" style={{ color: colorCode }} />
        {name}
      </li>
    ));
  }

  render() {
    const { customer } = this.props;
    const tags = customer.getTags;
    const { Title, QuickButtons } = Wrapper.Sidebar.Section;

    return (
      <Wrapper.Sidebar.Section>
        <Title>Tags</Title>

        <QuickButtons>
          <QuickButton tabIndex={0} onClick={this.toggleTagger}>
            <Icon icon="gear-a" />
          </QuickButton>
        </QuickButtons>

        <Collapse in={this.state.isTaggerVisible}>
          <div>
            <Tagger
              type="customer"
              targets={[customer]}
              className="sidebar-accordion"
              event="onClick"
              afterSave={this.props.customer.refetch}
            />
          </div>
        </Collapse>

        <SidebarList className="no-link">{this.renderTags(tags)}</SidebarList>
      </Wrapper.Sidebar.Section>
    );
  }
}

TaggerSection.propTypes = propTypes;

export default TaggerSection;
