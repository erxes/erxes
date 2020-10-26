import Box from 'modules/common/components/Box';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import { ISegment } from '../types';

type Props = {
  currentSegment?: string;
  setSegment: (segmentId: string) => void;
  removeSegment: () => void;
  contentType?: string;
  counts?: any;
  segments: ISegment[];
  loading: boolean;
};

class Segments extends React.Component<Props> {
  renderCancelBtn() {
    const { currentSegment, removeSegment } = this.props;

    if (!currentSegment) {
      return null;
    }

    return (
      <a href="#cancel" tabIndex={0} onClick={removeSegment}>
        <Icon icon="times-circle" />
      </a>
    );
  }

  renderQuickBtns() {
    const { contentType } = this.props;

    return (
      <>
        <Dropdown alignRight={true} style={{ float: 'left' }}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-manage">
            <a id="contacts-segments-settings" href="#settings">
              <Icon icon="cog" />
            </a>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li id={'SegmentsNewPage'}>
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
      </>
    );
  }

  onSegmentClick(segmentId) {
    const { setSegment } = this.props;
    setSegment(segmentId);
  }

  renderData() {
    const { counts, segments, currentSegment } = this.props;
    const orderedSegments: ISegment[] = [];

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
            className={segment.subOf ? 'child-segment' : ''}
          >
            <a
              href="#active"
              tabIndex={0}
              className={currentSegment === segment._id ? 'active' : ''}
              onClick={this.onSegmentClick.bind(this, segment._id)}
            >
              {segment.subOf ? '\u00a0\u00a0' : null}
              <Icon
                icon="chart-pie"
                style={{ color: segment.color, marginRight: '5px' }}
              />{' '}
              <FieldStyle>{segment.name}</FieldStyle>
              <SidebarCounter>{counts[segment._id]}</SidebarCounter>
            </a>
          </li>
        ))}
      </SidebarList>
    );
  }

  render() {
    const { segments, loading } = this.props;
    const extraButtons = this.renderQuickBtns();

    return (
      <Box
        title={__('Filter by segments')}
        extraButtons={extraButtons}
        collapsible={segments.length > 7}
        isOpen={true}
        name="showFilterBySegments"
      >
        <DataWithLoader
          data={this.renderData()}
          loading={loading}
          count={segments.length}
          emptyText="Open segments and starting add details"
          emptyIcon="chart-pie"
          size="small"
          objective={true}
        />
      </Box>
    );
  }
}

export default Segments;
