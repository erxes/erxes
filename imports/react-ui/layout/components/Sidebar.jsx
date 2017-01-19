import React, { PropTypes, Component } from 'react';
import ScrollArea from 'react-scrollbar';
import classNames from 'classnames';


const propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['narrow', 'medium', 'wide']),
};

function Sidebar({ children, size = 'medium' }) {
  return (
    <ScrollArea horizontal={false}>
      <div className={`sidebar ${size}`}>{children}</div>
    </ScrollArea>
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
    this.setState(
      {
        collapse: !this.state.collapse,
        maxHeight: this.state.collapse ? 220 : this.node.clientHeight + 20,
      }
    );
  }

  renderCollapseButton() {
    const icon = this.state.collapse ? 'ion-chevron-up' : 'ion-chevron-down';
    return (
      <a onClick={this.toggleCollapse} className="toggle-collapse">
        <i className={icon}></i>
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
        <div ref={node => { this.node = node; }}>
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

export default Sidebar;
