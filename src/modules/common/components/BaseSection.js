import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropIcon } from '../styles/main';
import { Sidebar } from 'modules/layout/components';
import { withRouter } from 'react-router';

const propTypes = {
  title: PropTypes.string,
  content: PropTypes.node,
  quickButtons: PropTypes.node,
  extraContent: PropTypes.node,
  isUseCustomer: PropTypes.bool,
  name: PropTypes.string,
  history: PropTypes.object
};

class BaseSection extends Component {
  constructor(props) {
    super(props);
    const { location } = props.history;

    this.state = { detailed: !(location.pathname === '/inbox') };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const { showSectionContent } = this.context;
    const { isUseCustomer, name } = this.props;
    const val = !this.state.detailed;

    this.setState({ detailed: val });

    if (showSectionContent && isUseCustomer) {
      showSectionContent(true, { name, val });
    }
  }

  renderDropBtn() {
    return <DropIcon onClick={this.toggle} isOpen={this.state.detailed} />;
  }

  renderContent() {
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;
    const { title, content, extraContent, quickButtons, history } = this.props;
    const hideContent = history.location.pathname === '/inbox';

    return (
      <Section>
        <Title>{title}</Title>

        <QuickButtons>
          {quickButtons}
          {hideContent && this.renderDropBtn()}
        </QuickButtons>

        {extraContent}

        {this.state.detailed && content}
      </Section>
    );
  }

  render() {
    return this.renderContent();
  }
}

BaseSection.propTypes = propTypes;
BaseSection.contextTypes = {
  showSectionContent: PropTypes.func
};

export default withRouter(BaseSection);
