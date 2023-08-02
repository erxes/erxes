import Assignees from '@erxes/ui-cards/src/boards/components/Assignees';
import { ActivityDate } from '@erxes/ui-log/src/activityLogs/styles';
import {
  BarItems,
  Button,
  ModalTrigger,
  Tip,
  Wrapper,
  __
} from '@erxes/ui/src';
import dayjs from 'dayjs';
import React from 'react';
import { FormContainer, ScheduleCard } from '../../styles';
import { Config, IPLan, ISchedule } from '../common/types';
import ScheduleForm from './ScheduleForm';

type Props = {
  history: any;
  removeSchedule: (_id) => void;
  refetch: () => void;
  plan: IPLan;
  list: ISchedule[];
};

class SchedulesConfig extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderDuplicateForm(props) {
    const onClick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <Button btnStyle="link" onClick={onClick} icon="files-landscapes-alt">
        {__('Duplicate')}
      </Button>
    );

    const content = ({ closeModal }) => {
      const updatedProps = {
        ...props,
        closeModal,
        duplicate: true
      };

      return <ScheduleForm {...updatedProps} />;
    };

    return (
      <ModalTrigger
        size="lg"
        title="Duplicate Schedule"
        content={content}
        trigger={trigger}
      />
    );
  }

  renderEditForm(props) {
    const trigger = (
      <Button btnStyle="link" icon="file-edit-alt">
        {__('Edit')}
      </Button>
    );
    const content = ({ closeModal }) => {
      const updatedProps = {
        ...props,
        closeModal
      };
      return <ScheduleForm {...updatedProps} />;
    };

    return (
      <ModalTrigger
        size="lg"
        title={`Edit Plan`}
        content={content}
        trigger={trigger}
      />
    );
  }

  renderAddForm() {
    const { plan, history, refetch } = this.props;
    const { configs, status } = plan;

    if (plan.status === 'archived') {
      return null;
    }

    const trigger = <Button btnStyle="success">{__('Add')}</Button>;

    const content = ({ closeModal }) => {
      const updatedProps = {
        history,
        plan: plan,
        closeModal,
        cardType: configs?.cardType,
        pipelineId: configs.pipelineId,
        refetch
      };

      return <ScheduleForm {...updatedProps} />;
    };

    return (
      <ModalTrigger
        title="Add Schedule"
        size="lg"
        content={content}
        trigger={trigger}
      />
    );
  }

  renderSchedule(schedule: ISchedule) {
    const { history, removeSchedule, plan, refetch } = this.props;
    const { configs = {} as Config } = plan;

    const handleRemomve = e => {
      e.stopPropagation();
      removeSchedule(schedule._id);
    };

    const updatedProps = {
      history,
      plan,
      cardType: configs.cardType,
      pipelineId: configs.pipelineId,
      schedule: schedule,
      refetch
    };

    return (
      <ScheduleCard key={schedule._id}>
        <FormContainer padding="0 0 10px 0" width="100%" column>
          <h4>{schedule.name}</h4>
          <FormContainer row spaceBetween>
            <Tip
              text={
                schedule?.createdAt
                  ? dayjs(schedule?.createdAt).format('llll')
                  : ''
              }
            >
              <ActivityDate>
                {schedule?.createdAt
                  ? dayjs(schedule?.createdAt).format('MMM D, h:mm A')
                  : ''}
              </ActivityDate>
            </Tip>
            <Assignees users={schedule?.assignedUsers || []} />
          </FormContainer>
        </FormContainer>
        {plan.status !== 'archived' && (
          <BarItems className="bottomBarItem">
            {this.renderEditForm(updatedProps)}
            {this.renderDuplicateForm(updatedProps)}

            <Button btnStyle="link" onClick={handleRemomve} icon="times-circle">
              {__('Remove')}
            </Button>
          </BarItems>
        )}
      </ScheduleCard>
    );
  }

  render() {
    const { list } = this.props;

    return (
      <>
        <Wrapper.ActionBar right={this.renderAddForm()} />
        <FormContainer row gap padding="25px">
          {list.map(schedule => this.renderSchedule(schedule))}
        </FormContainer>
      </>
    );
  }
}

export default SchedulesConfig;
