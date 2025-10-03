import {
  BOARD_STATUSES_OPTIONS,
  PROBABILITY_DEAL,
  VISIBILITIES,
} from '@/deals/constants/stages';
import { Checkbox, Form, Input, Select, Tooltip } from 'erxes-ui';
import {
  IconChevronDown,
  IconChevronUp,
  IconDragDrop2,
  IconTrashX,
} from '@tabler/icons-react';

import { Controller } from 'react-hook-form';
import { IStage } from '@/deals/types/stages';
import { SelectMember } from 'ui-modules';
import { SortableItemProps } from '@/deals/components/common/Item';
import { useState } from 'react';

interface Props extends SortableItemProps {
  stage: IStage;
  control: any;
  onRemoveStage: () => void;
}

const showTooltip = (icon: any, text: string) => {
  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>{icon}</Tooltip.Trigger>
        <Tooltip.Content>
          <p>{text}</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

const PipelineStageItem = (props: Props) => {
  const {
    dragging,
    dragOverlay,
    listeners,
    style,
    disabled,
    handle,
    color,
    fadeIn,
    transition,
    transform,
    wrapperStyle,
    index,
    stage,
    control,
    onRemoveStage,
  } = props;

  const [showExtraFields, setShowExtraFields] = useState(false);

  return (
    <div
      className={`
        flex box-border origin-top-left touch-manipulation [transform:translate3d(var(--translate-x,0),var(--translate-y,0),0)_scaleX(var(--scale-x,1))_scaleY(var(--scale-y,1))]
        ${fadeIn ? 'animate-fadeIn' : ''}
        ${
          dragOverlay
            ? 'z-[999] [--scale:1.05] [--box-shadow:0_0_0_calc(1px/var(--scale-x,1))_rgba(63,63,68,0.05),0_1px_calc(3px/var(--scale-x,1))_0_rgba(34,33,81,0.15)] [--box-shadow-picked-up:0_0_0_calc(1px/var(--scale-x,1))_rgba(63,63,68,0.05),-1px_0_15px_0_rgba(34,33,81,0.01),0px_15px_15px_0_rgba(34,33,81,0.25)]'
            : ''
        }
      `}
      style={
        {
          ...wrapperStyle,
          transition: [transition, wrapperStyle?.transition]
            .filter(Boolean)
            .join(', '),
          '--translate-x': transform
            ? `${Math.round(transform.x)}px`
            : undefined,
          '--translate-y': transform
            ? `${Math.round(transform.y)}px`
            : undefined,
          '--scale-x': transform?.scaleX ? `${transform.scaleX}` : undefined,
          '--scale-y': transform?.scaleY ? `${transform.scaleY}` : undefined,
          '--index': index,
          '--color': color,
        } as React.CSSProperties
      }
    >
      <div
        className={`
          relative flex flex-grow items-center
          px-5 py-[18px] bg-white rounded
          shadow-md list-none select-none
          text-gray-800 font-normal text-base
          whitespace-nowrap
          transition-shadow duration-200 ease-out
          ${!handle ? 'cursor-grab touch-manipulation' : ''}
          ${dragging && !dragOverlay ? 'opacity-50' : ''}
          ${disabled ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : ''}
          ${dragOverlay ? 'cursor-default shadow-lg' : ''}
        `}
        style={style}
        data-cypress="draggable-item"
        {...props}
        tabIndex={!handle ? 0 : undefined}
      >
        <span className="absolute top-1/2 left-0 h-full w-[3px] -translate-y-1/2 rounded-l-sm bg-purple-500" />
        <div {...listeners} className="cursor-grab p-2 pl-0">
          <IconDragDrop2 />
        </div>

        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap gap-3 justify-between">
              <Form.Item className="flex-1">
                <Form.Label>Stage Name</Form.Label>
                <Form.Control>
                  <Controller
                    name={`stages.${index}.name`}
                    control={control}
                    defaultValue={stage?.name || ''}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter stage name"
                      />
                    )}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
              <Form.Item className="flex-1">
                <Form.Label>Probability</Form.Label>
                <Controller
                  name={`stages.${index}.probability`}
                  control={control}
                  defaultValue={stage?.probability || ''}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger className={'text-muted-foreground h-8'}>
                        {field.value || 'Select probability'}
                      </Select.Trigger>
                      <Select.Content>
                        {PROBABILITY_DEAL.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  )}
                />
              </Form.Item>
              <Form.Item className="flex-1">
                <Form.Label>Status</Form.Label>
                <Controller
                  name={`stages.${index}.status`}
                  control={control}
                  defaultValue={stage?.status || ''}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger className="text-muted-foreground h-8">
                        {field.value || 'Select status'}
                      </Select.Trigger>
                      <Select.Content>
                        {BOARD_STATUSES_OPTIONS.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  )}
                />
              </Form.Item>

              <Form.Item className="flex-1">
                <Form.Label>Visibility</Form.Label>
                <Controller
                  name={`stages.${index}.visibility`}
                  control={control}
                  defaultValue={stage?.visibility || ''}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger className="text-muted-foreground h-8">
                        {field.value || 'Select visibility'}
                      </Select.Trigger>
                      <Select.Content>
                        {VISIBILITIES.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  )}
                />
              </Form.Item>
            </div>
            {showExtraFields && (
              <div className="flex flex-wrap justify-between gap-3 mt-2">
                <Form.Item className="flex-1">
                  <Form.Label>Code</Form.Label>
                  <Form.Control>
                    <Controller
                      name={`stages.${index}.code`}
                      control={control}
                      defaultValue={stage?.code || ''}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter code"
                          className="input"
                        />
                      )}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>

                <Form.Item className="flex-1">
                  <Form.Label>Age</Form.Label>
                  <Form.Control>
                    <Controller
                      name={`stages.${index}.age`}
                      control={control}
                      defaultValue={stage?.age || ''}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter age"
                          className="input"
                          type="number"
                        />
                      )}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>

                <Form.Item className="flex-1">
                  <Form.Label>Can move members</Form.Label>
                  <Form.Control>
                    <Controller
                      name={`stages.${index}.canMoveMemberIds`}
                      control={control}
                      defaultValue={stage?.canMoveMemberIds || ''}
                      render={({ field }) => (
                        <SelectMember.FormItem
                          mode="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      )}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>

                <Form.Item className="flex-1">
                  <Form.Label>Can edit members</Form.Label>
                  <Form.Control>
                    <Controller
                      name={`stages.${index}.canEditMemberIds`}
                      control={control}
                      defaultValue={stage?.canEditMemberIds || ''}
                      render={({ field }) => (
                        <SelectMember.FormItem
                          mode="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      )}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>

                <Form.Item className="flex flex-row items-center justify-center space-x-3 space-y-0">
                  <Form.Control>
                    <Controller
                      name={`stages.${index}.defaultTick`}
                      control={control}
                      defaultValue={stage?.defaultTick || false}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </Form.Control>
                </Form.Item>
              </div>
            )}
          </div>

          <div
            className={`
              flex items-center gap-1 text-xs text-purple-500 cursor-pointer
              px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 transition-colors duration-150
              select-none
            `}
            onClick={() => setShowExtraFields(!showExtraFields)}
          >
            {showExtraFields
              ? showTooltip(<IconChevronUp size={14} />, 'Hide extra fields')
              : showTooltip(<IconChevronDown size={14} />, 'Show extra fields')}
          </div>

          <div
            className={`
              flex items-center gap-1 text-xs text-red-500 cursor-pointer
              px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors duration-150
              select-none
            `}
            onClick={onRemoveStage}
          >
            <IconTrashX size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineStageItem;
