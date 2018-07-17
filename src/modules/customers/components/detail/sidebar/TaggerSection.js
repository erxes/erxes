import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-bootstrap';
import { SidebarList } from 'modules/layout/styles';
import { EmptyState, Tagger, Icon } from 'modules/common/components';
import { BaseSection } from './';

const propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  afterSave: PropTypes.func
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
    const { data, type, afterSave } = this.props;
    const tags = data.getTags || [];
    const { __ } = this.context;

    const quickButtons = (
      <a tabIndex={0} onClick={this.toggleTagger}>
        <Icon icon="settings" />
      </a>
    );

    const extraContent = (
      <Collapse in={this.state.isTaggerVisible}>
        <div>
          <Tagger
            type={type}
            targets={[data]}
            className="sidebar-accordion"
            event="onClick"
            afterSave={afterSave}
          />
        </div>
      </Collapse>
    );

    const content = (
      <SidebarList className="no-link">{this.renderTags(tags)}</SidebarList>
    );

    return (
      <BaseSection
        title={__('Tags')}
        content={content}
        extraContent={extraContent}
        quickButtons={quickButtons}
        isUseCustomer={true}
        name="showTags"
      />
    );
  }
}

TaggerSection.propTypes = propTypes;
TaggerSection.contextTypes = {
  __: PropTypes.func
};

export default TaggerSection;
