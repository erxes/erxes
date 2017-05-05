import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { FilterableList } from '/imports/react-ui/common';

const propTypes = {
  fields: PropTypes.array.isRequired,
  saveConfig: PropTypes.func.isRequired,
};

class ManageColumns extends Component {
  render() {
    const popover = (
      <Popover id="manage-columns-popover" title="Manage columns">
        <FilterableList
          items={this.props.fields}
          onClick={items => {
            const fields = items.filter(item => item.selectedBy === 'all').map(item => ({
              key: item._id,
              label: item.title,
            }));
            this.props.saveConfig(fields);
          }}
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={popover}
        rootClose
      >
        <i className="ion-more" role="button" title="Manage columns" />
      </OverlayTrigger>
    );
  }
}

ManageColumns.propTypes = propTypes;

export default ManageColumns;
