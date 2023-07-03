import { IItem, IOptions } from '../../types';

import { ActionContainer } from '../../styles/item';
import { ArchiveBtn } from './ArchiveBtn';
import ChecklistAdd from '../../../checklists/components/AddButton';
import { ColorButton } from '../../styles/common';
import Icon from '@erxes/ui/src/components/Icon';
import LabelChooser from '../../containers/label/LabelChooser';
import { PRIORITIES } from '../../constants';
import { PopoverButton } from '@erxes/ui-inbox/src/inbox/styles';
import PriorityIndicator from './PriorityIndicator';
import React from 'react';
import SelectItem from '../../components/SelectItem';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import Tags from '@erxes/ui/src/components/Tags';
import Watch from '../../containers/editForm/Watch';
import Comment from '../../../comment/containers/Comment';
import { loadDynamicComponent, __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import PrintActionButton from './PrintDocumentBtn';
import { Button } from 'react-bootstrap';

type Props = {
  item: IItem;
  options: IOptions;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  sendToBoard?: (item: any) => void;
  onChangeStage?: (stageId: string) => void;
  onChangeRefresh: () => void;
};

class Actions extends React.Component<Props> {
  onPriorityChange = (value: string) => {
    const { onUpdate, saveItem } = this.props;

    if (saveItem) {
      saveItem({ priority: value }, updatedItem => {
        onUpdate(updatedItem);
      });
    }
  };

  render() {
    const {
      item,
      saveItem,
      options,
      copyItem,
      removeItem,
      sendToBoard,
      onChangeStage,
      onChangeRefresh
    } = this.props;

    const onLabelChange = labels => saveItem({ labels });

    const tags = item.tags || [];
    const pipelineTagId = item.pipeline.tagId || '';

    const priorityTrigger = (
      <ColorButton>
        {item.priority ? (
          <PriorityIndicator value={item.priority} />
        ) : (
          <Icon icon="sort-amount-up" />
        )}
        {item.priority ? item.priority : __('Priority')}
      </ColorButton>
    );

    const TAG_TYPE =
      options.type === 'deal'
        ? TAG_TYPES.DEAL
        : options.type === 'task'
        ? TAG_TYPES.TASK
        : options.type === 'purchase' // Add a new condition for 'purchase'
        ? TAG_TYPES.PURCHASE
        : TAG_TYPES.TICKET;

    const tagTrigger = (
      <PopoverButton id="conversationTags">
        {tags.length ? (
          <>
            <Tags tags={tags} limit={1} /> <Icon icon="angle-down" />
          </>
        ) : (
          <ColorButton>
            <Icon icon="tag-alt" /> No tags
          </ColorButton>
        )}
      </PopoverButton>
    );

    return (
      <ActionContainer>
        <SelectItem
          items={PRIORITIES}
          selectedItems={item.priority}
          onChange={this.onPriorityChange}
          trigger={priorityTrigger}
        />

        <LabelChooser
          item={item}
          onSelect={onLabelChange}
          onChangeRefresh={onChangeRefresh}
        />

        <ChecklistAdd itemId={item._id} type={options.type} />

        <Watch item={item} options={options} isSmall={true} />
        {(isEnabled('clientportal') && <Comment item={item} />) || ''}
        <ColorButton onClick={copyItem}>
          <Icon icon="copy-1" />
          {__('Copy')}
        </ColorButton>
        <ArchiveBtn
          item={item}
          removeItem={removeItem}
          saveItem={saveItem}
          sendToBoard={sendToBoard}
          onChangeStage={onChangeStage}
        />
        {isEnabled('tags') && (
          <TaggerPopover
            type={TAG_TYPE}
            trigger={tagTrigger}
            refetchQueries={['dealDetail', 'taskDetail', 'ticketDetail']}
            targets={[item]}
            parentTagId={pipelineTagId}
            singleSelect={true}
          />
        )}

        {/* {loadDynamicComponent('cardDetailAction', { item }, true)} */}
        {isEnabled('documents') && <PrintActionButton item={item} />}
      </ActionContainer>
    );
  }
}

export default Actions;
