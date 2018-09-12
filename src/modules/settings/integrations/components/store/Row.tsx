import { __ } from 'modules/common/utils';
import { IntegrationList } from 'modules/settings/integrations/containers/common';
import React, { Component, Fragment } from 'react';
import { Collapse } from 'react-bootstrap';
import Entry from './Entry';
import { CollapsibleContent, IntegrationRow } from './styles';

type Props = {
  integrations: any[],
  title: string,
  totalCount: any
};

type State = {
  isContentVisible: boolean,
  kind: null
};

class Row extends Component<Props, State> {
  constructor(props: Props) {
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

    return null;
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

      return { kind: selectedKind, isContentVisible: prevState.isContentVisible };
    });

    return null;
  }

  renderIntegrations() {
    const { isContentVisible, kind } = this.state;

    if (!isContentVisible) {
      return null;
    }

    return <IntegrationList kind={kind} />;
  }

  render() {
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

export default Row;
