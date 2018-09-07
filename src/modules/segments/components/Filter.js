import * as React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import {
  DropdownToggle,
  Icon,
  DataWithLoader
} from 'modules/common/components';

const propTypes = {
  currentSegment: PropTypes.string,
  setSegment: PropTypes.func,
  removeSegment: PropTypes.func,
  contentType: PropTypes.string.isRequired,
  counts: PropTypes.object.isRequired,
  segments: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

class Segments extends React.Component {
  renderCancelBtn() {
    const { currentSegment, removeSegment } = this.props;

    if (!currentSegment) {
      return null;
    }

    return (
      <a tabIndex={0} onClick={() => removeSegment()}>
        <Icon icon="cancel-1" />
      </a>
    );
  }

  renderQuickBtns() {
    const { contentType } = this.props;
    const { Section } = Wrapper.Sidebar;
    const { __ } = this.context;

    return (
      <Section.QuickButtons>
        <Dropdown
          id="dropdown-user"
          className="quick-button"
          pullRight
          style={{ verticalAlign: 'top', float: 'left' }}
        >
          <DropdownToggle bsRole="toggle">
            <a>
              <Icon icon="settings" />
            </a>
          </DropdownToggle>
          <Dropdown.Menu>
            <li>
              <Link to={`/segments/new/${contentType}`}>
                {__('New segment')}
              </Link>
            </li>
            <li>
              <Link to={`/segments/${contentType}`}>
                {__('Manage segments')}
              </Link>
            </li>
          </Dropdown.Menu>
        </Dropdown>

        {this.renderCancelBtn()}
      </Section.QuickButtons>
    );
  }

  renderData() {
    const { counts, segments, currentSegment, setSegment } = this.props;
    const orderedSegments = [];

    segments.forEach(segment => {
      if (!segment.subOf) {
        orderedSegments.push(segment, ...segment.getSubSegments);
      }
    });

    return (
      <SidebarList>
        {orderedSegments.map(segment => (
          <li
            key={segment._id}
            className={segment.subOf ? 'child-segment' : null}
          >
            <a
              tabIndex={0}
              className={currentSegment === segment._id ? 'active' : ''}
              onClick={() => setSegment(segment._id)}
            >
              {segment.subOf ? '\u00a0\u00a0' : null}
              <Icon
                icon="piechart"
                size={10}
                style={{ color: segment.color, marginRight: '5px' }}
              />{' '}
              {segment.name}
              <SidebarCounter>{counts[segment._id]}</SidebarCounter>
            </a>
          </li>
        ))}
      </SidebarList>
    );
  }

  render() {
    const { segments, loading } = this.props;
    const { __ } = this.context;

    const { Section, Header } = Wrapper.Sidebar;

    return (
      <Section collapsible={segments.length > 5}>
        <Header uppercase>{__('Filter by segments')}</Header>

        {this.renderQuickBtns()}

        <DataWithLoader
          data={this.renderData()}
          loading={loading}
          count={segments.length}
          emptyText="No segments"
          emptyIcon="pie-graph"
          size="small"
          objective={true}
        />
      </Section>
    );
  }
}

Segments.propTypes = propTypes;
Segments.contextTypes = {
  __: PropTypes.func
};

export default Segments;
