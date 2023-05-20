import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { ToggleIcon } from '../../../erxes-ui/src/components/filterableList/styles';

import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { ISegment } from '../types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  currentSegment?: string;
  setSegment: (segmentId: string) => void;
  removeSegment: () => void;
  contentType?: string;
  counts?: any;
  segments: ISegment[];
  loading: boolean;
};

type State = {
  key: string;
  parentFieldIds: { [key: string]: boolean };
};

class Segments extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      key: '',
      parentFieldIds: {}
    };
  }
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
              <Link to={`/segments/new?contentType=${contentType}`}>
                {__('New segment')}
              </Link>
            </li>
            <li>
              <Link to={`/segments?contentType=${contentType}`}>
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

  onToggle = (id: string, isOpen: boolean) => {
    const parentFieldIds = this.state.parentFieldIds;
    parentFieldIds[id] = !isOpen;

    this.setState({ parentFieldIds });
  };

  groupByParent = (array: any[]) => {
    const key = 'subOf';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  renderData() {
    const { counts, segments, currentSegment } = this.props;
    const orderedSegments: ISegment[] = [];
    const { key } = this.state;

    segments.forEach(segment => {
      if (!segment.subOf) {
        orderedSegments.push(segment, ...segment.getSubSegments);
      }
    });

    const renderOrderItem = (field: ISegment, isOpen?: boolean) => {
      if (key && field.name.toLowerCase().indexOf(key) < 0) {
        return false;
      }

      if (!field._id || !field.name) {
        return null;
      }

      return (
        <li key={field._id} className={field.subOf ? 'child-segment' : ''}>
          <a
            href="#active"
            tabIndex={0}
            className={currentSegment === field._id ? 'active' : ''}
            onClick={this.onSegmentClick.bind(this, field._id)}
          >
            {field.subOf ? '\u00a0\u00a0' : null}
            <Icon
              icon="chart-pie"
              style={{ color: field.color, marginRight: '5px' }}
            />{' '}
            <FieldStyle>{field.name}</FieldStyle>
            <SidebarCounter>{counts[field._id]}</SidebarCounter>
          </a>
        </li>
      );
    };

    const renderContent = () => {
      const subFields = orderedSegments.filter(f => f.subOf);
      const parents = orderedSegments.filter(f => !f.subOf);
      const groupByParent = this.groupByParent(subFields);

      const renderTree = field => {
        const childrens = groupByParent[field._id];
        if (childrens) {
          const isOpen = this.state.parentFieldIds[field._id];

          return (
            <div key={field._id}>
              <ToggleIcon
                onClick={this.onToggle.bind(this, field._id, isOpen)}
                type="params"
              >
                <Icon icon={isOpen ? 'angle-down' : 'angle-right'} />
              </ToggleIcon>

              {renderOrderItem(field, isOpen)}
              {isOpen &&
                childrens.map(childField => {
                  return renderTree(childField);
                })}
            </div>
          );
        }

        return renderOrderItem(field);
      };

      return parents.map(field => {
        return renderTree(field);
      });
    };

    return <SidebarList>{renderContent()}</SidebarList>;
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
        noShadow={true}
        noMarginBottom={true}
        noBackground
        noSpacing
      >
        <DataWithLoader
          data={this.renderData()}
          loading={loading}
          count={segments.length}
          emptyText="Open segments and starting add details"
          emptyIcon="chart-pie"
          size="small"
          objective={true}
        />
      </Box>
    );
  }
}

export default Segments;
