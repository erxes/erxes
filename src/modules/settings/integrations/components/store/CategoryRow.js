import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-bootstrap';
import { IntegrationList } from '../../containers/common';
import {
  IntegrationItem,
  IntegrationRow,
  CollapsibleContent,
  Box
} from './styles';

const propTypes = {
  queryParams: PropTypes.object,
  integrations: PropTypes.array,
  title: PropTypes.string,
  history: PropTypes.object,
  totalCount: PropTypes.object,
  toggleBox: PropTypes.func
};

class CategoryRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isContentVisible: false,
      kind: null
    };

    this.toggleBox = this.toggleBox.bind(this);
  }

  getClassName(kind) {
    if (kind === this.state.kind && this.state.isContentVisible) {
      return 'active';
    }
    return null;
  }

  toggleBox(kind) {
    if (!kind) {
      return false;
    }

    const { isContentVisible } = this.state;

    this.setState(prevState => {
      if (
        prevState.kind === kind ||
        this.state.kind === null ||
        !isContentVisible
      ) {
        return { isContentVisible: !isContentVisible, kind };
      }

      return { kind };
    });
  }

  renderIntegrations() {
    const { isContentVisible, kind } = this.state;

    if (!isContentVisible) {
      return null;
    }

    return <IntegrationList queryParams={{ kind }} />;
  }

  getCount(kind) {
    const { totalCount } = this.props;
    const countByKind = totalCount[kind];
    if (countByKind) {
      return <span>({countByKind})</span>;
    }

    return null;
  }

  renderContent() {
    const { integrations, title } = this.props;

    return (
      <Fragment>
        {title && <h3>{title}</h3>}
        <IntegrationRow>
          {integrations.map(integration => (
            <IntegrationItem
              key={integration.name}
              className={this.getClassName(integration.kind)}
            >
              <Box onClick={() => this.toggleBox(integration.kind)}>
                <img alt="logo" src={integration.logo} />
                <h5>
                  {integration.name} {this.getCount(integration.kind)}
                </h5>
                <p>{integration.description}</p>
                <a>+ Add</a>
              </Box>
            </IntegrationItem>
          ))}
        </IntegrationRow>
        <Collapse in={this.state.isContentVisible}>
          <CollapsibleContent>{this.renderIntegrations()}</CollapsibleContent>
        </Collapse>
      </Fragment>
    );
  }
  render() {
    return this.renderContent();
  }
}

CategoryRow.propTypes = propTypes;
CategoryRow.contextTypes = {
  __: PropTypes.func
};

export default CategoryRow;
