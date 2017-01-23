import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import { FlowRouter } from 'meteor/kadira:flow-router';


const propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['narrow', 'medium', 'wide']),
};

function Sidebar({ children, size = 'medium' }) {
  return (
    <div className={`sidebar ${size}`}>{children}</div>
  );
}

class Section extends Component {
  constructor(props) {
    super(props);

    this.state = { collapse: false, maxHeight: 220 };

    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.renderCollapseButton = this.renderCollapseButton.bind(this);
  }

  toggleCollapse() {
    this.setState({
      collapse: !this.state.collapse,
      maxHeight: this.state.collapse ? 220 : this.node.clientHeight + 20,
    });
  }

  renderCollapseButton() {
    const icon = this.state.collapse ? 'ion-chevron-up' : 'ion-chevron-down';
    return (
      <a tabIndex={0} onClick={this.toggleCollapse} className="toggle-collapse">
        <i className={icon} />
      </a>
    );
  }

  render() {
    const { children, collapsible } = this.props;
    const classes = classNames({
      section: true,
      collapsible,
    });
    const height = {
      maxHeight: collapsible ? this.state.maxHeight : 'none',
    };
    return (
      <div className={classes} style={height}>
        <div ref={(node) => { this.node = node; }}>
          {children}
        </div>
        {collapsible ? this.renderCollapseButton() : null}
      </div>
    );
  }
}

Section.propTypes = {
  children: PropTypes.node,
  collapsible: PropTypes.bool,
};

Sidebar.propTypes = propTypes;
Sidebar.Section = Section;

Sidebar.filter = (queryParamName, value) => {
  FlowRouter.setQueryParams({ [queryParamName]: value });
};

Sidebar.getActiveClass = (queryParamName, value) => {
  const queryParam = FlowRouter.getQueryParam(queryParamName);
  return queryParam === value ? 'active' : '';
};

export default Sidebar;
