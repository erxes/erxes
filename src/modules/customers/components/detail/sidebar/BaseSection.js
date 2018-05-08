import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropIcon } from 'modules/common/styles/main';
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
  constructor(props, context) {
    super(props);
    const { history, name } = props;
    const { queryParams } = context;

    this.state = {
      detailed:
        !(history.location.pathname === '/inbox') ||
        (queryParams && queryParams[name])
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const { showSectionContent } = this.context;
    const { isUseCustomer = false, name } = this.props;
    const val = !this.state.detailed;
    this.setState({ detailed: val });

    showSectionContent && showSectionContent(isUseCustomer, { name, val });
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
  showSectionContent: PropTypes.func,
  queryParams: PropTypes.object
};

export default withRouter(BaseSection);
