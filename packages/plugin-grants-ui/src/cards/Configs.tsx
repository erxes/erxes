import React from 'react';
import {
  ControlLabel,
  BarItems,
  CollapseContent,
  Icon,
  __,
} from '@erxes/ui/src';
import { Card } from './styles';
import BoardSelect from '@erxes/ui-tickets/src/boards/containers/BoardSelect';
import CardActionComponent from './ActionComponent';

type Props = {
  scope: string;
  action: string;
  params: any;
  config: any;
  handleSelect: (value: any, name: string) => void;
};

const Config: React.FC<Props> = (props: Props) => {
  const { action, params, config, handleSelect } = props;

  const renderActionComponent = () => {
    if (!config.type) {
      return null;
    }

    const updatedProps = {
      action: action,
      initialProps: {
        ...params,
      },
      source: {
        ...config,
      },
      onChange: (params) => handleSelect(params, 'params'),
    };

    return (
      <CollapseContent title={__("Action Configuration")}>
        <CardActionComponent {...updatedProps} />
      </CollapseContent>
    );
  };

  if (!action) {
    return null;
  }

  const options = [
    { value: 'deal', label: 'Deal', icon: 'piggy-bank' },
    { value: 'task', label: 'Task', icon: 'file-check-alt' },
    { value: 'ticket', label: 'Ticket', icon: 'ticket' },
  ];

  const onChangeBoard = (value, name) => {
    handleSelect({ ...config, [name]: value }, 'config');
  };

  let selectCardType = (
    <>
      <ControlLabel required>{__('Card Type')}</ControlLabel>
      <BarItems>
        {options.map((option) => {
          return (
            <Card
              key={option.value}
              className={config['type'] === option.value ? 'active' : ''}
              onClick={() =>
                handleSelect({ ...config, type: option.value }, 'config')
              }
            >
              <Icon icon={option.icon} />
              <ControlLabel>{option.label}</ControlLabel>
            </Card>
          );
        })}
      </BarItems>
    </>
  );

  let boardSelect = !!config['type'] && (
    <BoardSelect
      type={config['type']}
      boardId={config?.boardId}
      pipelineId={config?.pipelineId}
      stageId={config?.stageId}
      onChangeBoard={(e) => onChangeBoard(e, 'boardId')}
      onChangePipeline={(e) => onChangeBoard(e, 'pipelineId')}
      onChangeStage={(e) => onChangeBoard(e, 'stageId')}
    />
  );

  return (
    <>
      <CollapseContent title={__("Main Configuration")}>
        {selectCardType}
        {boardSelect}
      </CollapseContent>
      {renderActionComponent()}
    </>
  );
};

export default Config;
