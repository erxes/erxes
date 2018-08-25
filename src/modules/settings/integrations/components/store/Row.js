import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-bootstrap';
import { IntegrationList } from 'modules/settings/integrations/containers/common';
import Entry from './Entry';
import { IntegrationRow, CollapsibleContent } from './styles';

const propTypes = {
  integrations: PropTypes.array,
  title: PropTypes.string,
  totalCount: PropTypes.object
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isContentVisible: false,
      kind: null
    };

    this.toggleBox = this.toggleBox.bind(this);
    this.getClassName = this.getClassName.bind(this);
  }

  getClassName(selectedKind) {
    const { kind, isContentVisible } = this.state;

    if (!isContentVisible) {
      return null;
    }

    if (selectedKind === kind) {
      return 'active';
    }
  }

  toggleBox(selectedKind) {
    if (!selectedKind) {
      return false;
    }

    const { isContentVisible, kind } = this.state;

    this.setState(prevState => {
      if (
        prevState.kind === selectedKind ||
        kind === null ||
        !isContentVisible
      ) {
        return { isContentVisible: !isContentVisible, kind: selectedKind };
      }

      return { kind: selectedKind };
    });
  }

  renderIntegrations() {
    const { isContentVisible, kind } = this.state;

    if (!isContentVisible) {
      return null;
    }

    return <IntegrationList kind={kind} />;
  }

  render() {
    const { __ } = this.context;
    const { integrations, title, totalCount } = this.props;

    return (
      <Fragment>
        {title && <h3>{__(title)}</h3>}
        <IntegrationRow>
          {integrations.map(integration => (
            <Entry
              key={integration.name}
              integration={integration}
              toggleBox={this.toggleBox}
              getClassName={this.getClassName}
              totalCount={totalCount}
            />
          ))}
        </IntegrationRow>
        <Collapse in={this.state.isContentVisible}>
          <CollapsibleContent>{this.renderIntegrations()}</CollapsibleContent>
        </Collapse>
      </Fragment>
    );
  }
}

Row.propTypes = propTypes;
Row.contextTypes = {
  __: PropTypes.func
};

export default Row;
