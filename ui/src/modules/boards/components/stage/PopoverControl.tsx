import React from 'react';
import { ActionButton, ActionList } from 'modules/boards/styles/stage';
import { OverlayTrigger, Popover, Dropdown } from 'react-bootstrap';
import Icon from 'modules/common/components/Icon';
import { IStage } from '../../types';
import { __ } from 'modules/common/utils';

type Props = {
  stage: IStage;
  archiveItems: () => void;
  archiveList: () => void;
  removeStage: (stageId: string) => void;
  sortItems: (type: string, description: string) => void;
};

type State = {
  showSortOptions: boolean;
};

class PopoverControl extends React.Component<Props, State> {
  private overlayTrigger;

  constructor(props: Props) {
    super(props);

    this.state = { showSortOptions: false };
  }

  onClosePopover = () => {
    this.overlayTrigger.hide();
  };

  renderSortOptions() {
    const { showSortOptions } = this.state;

    if (!showSortOptions) {
      return null;
    }

    const sortItems = (type: string, description: string) => {
      this.props.sortItems(type, description);
      this.onClosePopover();
    };

    return (
      <>
        <li onClick={this.toggleSortOptions}>Back</li>

        <Dropdown.Divider />

        <li
          onClick={sortItems.bind(
            this,
            'created-desc',
            'date created (newest first)'
          )}
        >
          Date created (Newest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'created-asc',
            'date created (oldest first)'
          )}
        >
          Date created (Oldest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'modified-desc',
            'date modified (newest first)'
          )}
        >
          Date modified (Newest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'modified-asc',
            'date modified (oldest first)'
          )}
        >
          Date modified (Oldest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'close-asc',
            'date assigned (Earliest first)'
          )}
        >
          Date assigned (Earliest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'close-desc',
            'date assigned (Latest first)'
          )}
        >
          Date assigned (Latest first)
        </li>
        <li
          onClick={sortItems.bind(this, 'alphabetically-asc', 'alphabetically')}
        >
          Alphabetically
        </li>
      </>
    );
  }

  toggleSortOptions = () => {
    const { showSortOptions } = this.state;

    this.setState({ showSortOptions: !showSortOptions });
  };

  renderPopover() {
    const { stage } = this.props;
    const { showSortOptions } = this.state;

    const archiveList = () => {
      this.props.archiveList();
      this.onClosePopover();
    };

    const archiveItems = () => {
      this.props.archiveItems();
      this.onClosePopover();
    };

    const removeStage = () => {
      this.props.removeStage(stage._id);
      this.onClosePopover();
    };

    return (
      <Popover id="stage-popover">
        <ActionList>
          {showSortOptions ? (
            this.renderSortOptions()
          ) : (
            <>
              <li onClick={archiveItems} key="archive-items">
                {__('Archive All Cards in This List')}
              </li>
              <li onClick={archiveList} key="archive-list">
                {__('Archive This List')}
              </li>
              <li onClick={removeStage} key="remove-stage">
                {__('Remove stage')}
              </li>

              <Dropdown.Divider />

              <li onClick={this.toggleSortOptions}>{__('Sort By')}</li>
            </>
          )}
        </ActionList>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom-start"
        rootClose={true}
        container={this}
        overlay={this.renderPopover()}
      >
        <ActionButton>
          <Icon icon="ellipsis-h" />
        </ActionButton>
      </OverlayTrigger>
    );
  }
}

export default PopoverControl;
