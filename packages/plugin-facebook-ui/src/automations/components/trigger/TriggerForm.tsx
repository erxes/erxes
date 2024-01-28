import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { ITrigger } from '@erxes/ui-segments/src/types';
import {
  Button,
  Chip,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  __,
} from '@erxes/ui/src';
import { Column, LinkButton, ModalFooter } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import { TriggerItem, TriggersList } from '../../styles';
import BotSelector from './BotSelector';
import DirectMessageForm from './DirectMessage';

type Props = {
  activeTrigger: ITrigger;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerConst: any;
};

function TriggerForm({
  activeTrigger,
  addConfig,
  closeModal,
  triggerConst,
}: Props) {
  const [config, setConfig] = useState(activeTrigger.config || {});
  const [activeItem, setActiveItem] = useState('');

  const onChangeConfig = (_id, name, value, isNew?) => {
    console.log(_id, name, value, isNew);
    const { conditions = [] } = config;

    let updatedConditions;

    if (!_id && isNew) {
      updatedConditions = [
        ...conditions,
        { _id: Math.random().toString(), [name]: value },
      ];
    } else {
      updatedConditions = conditions.map((cond) =>
        cond._id === _id ? { ...cond, [name]: value } : cond,
      );
    }

    setConfig({
      ...config,
      conditions: updatedConditions,
    });
  };

  const persistentMenuForm = ({}) => {
    return <>persistent Menu</>;
  };

  const renderConditionForm = (type, config) => {
    console.log({ config });
    // if (!config?.botId) {
    //   return <EmptyState text='Select Bot' image='/images/erxes-bot.svg' />;
    // }

    const updatedProps = {
      ...config,
      onChange: onChangeConfig,
    };

    switch (type) {
      case 'direct':
        // return directMessageForm(config);
        return <DirectMessageForm {...updatedProps} />;
      case 'persistentMenu':
        return persistentMenuForm(config);

      default:
        return null;
    }
  };

  const renderCondition = (
    { type, label, description, icon, ...condition },
    { activeItem, setActiveItem },
    isNew?: boolean,
  ) => {
    if (!!activeItem && activeItem !== type) {
      return null;
    }

    const addTrigger = () => {
      const updatedConfig = {
        ...config,
        conditions: [
          ...(config.conditions || []),
          { _id: Math.random().toString(), type, label, description, icon },
        ],
      };

      setConfig(updatedConfig);

      setActiveItem(!activeItem ? type : '');
    };

    const renderDetail = () => {
      if (activeItem === type) {
        const onSave = () => {
          addConfig(activeTrigger, activeTrigger.id, config);
          setActiveItem('');
        };

        return (
          <DrawerDetail>
            {renderConditionForm(type, { ...condition, isNew })}
            <ModalFooter>
              <Button btnStyle="simple" onClick={() => closeModal()}>
                {__('Cancel')}
              </Button>
              <Button btnStyle="success" onClick={onSave}>
                {__('Save')}
              </Button>
            </ModalFooter>
          </DrawerDetail>
        );
      }
      return null;
    };

    return (
      <>
        <TriggerItem isActive={type === activeItem} onClick={addTrigger}>
          <Icon icon={icon} />
          <div>
            <label>{label}</label>
            <p>{description}</p>
          </div>
        </TriggerItem>
        {renderDetail()}
      </>
    );
  };

  const renderTriggerForm = (conditions = []) => {
    return (
      <>
        <BotSelector />

        <ControlLabel>Triggers</ControlLabel>

        <TriggersList>
          {conditions.map((condition) =>
            renderCondition(condition, { activeItem, setActiveItem }, true),
          )}
        </TriggersList>
      </>
    );
  };

  if (!config?.conditions?.length) {
    return renderTriggerForm(triggerConst?.conditions);
  }

  return <>{renderTriggerForm(config?.conditions)}</>;
}

export default TriggerForm;
