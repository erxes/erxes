import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  mutations,
  queries
} from '@erxes/ui-cards/src/settings/boards/graphql';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { LinkButton } from '@erxes/ui/src/styles/main';
import Modal from 'react-bootstrap/Modal';
import { __ } from 'coreui/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import Table from '@erxes/ui/src/components/table';
import { IGoalType, IGoalTypeDoc, IAssignmentCampaign } from '../types';
import * as path from 'path';

import {
  ControlLabel,
  Form,
  DateControl,
  MainStyleFormColumn as FormColumn,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { ENTITY, CONTRIBUTION, FREQUENCY, GOAL_TYPE } from '../constants';

import { DateContainer } from '@erxes/ui/src/styles/main';
import dayjs from 'dayjs';
import client from '@erxes/ui/src/apolloClient';
import { IPipelineLabel } from '@erxes/ui-cards/src/boards/types';
import { queries as pipelineQuery } from '@erxes/ui-cards/src/boards/graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';

import styled from 'styled-components';
import { TabTitle, Tabs as MainTabs } from '@erxes/ui/src';

import { ModalTrigger } from '@erxes/ui/src';
import GoalTypeForm from './goalForm';
type Props = {
  goalType: any;
  //   onClose: () => void;
};
// tslint:disable-next-line:class-name
type State = {};
// tslint:disable-next-line:class-name

import React, { Component } from 'react';

class GoalNotification extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { goalType = {} } = props;
    console.log(goalType, 'goalType');
    this.state = {
      // Initialize your state here if necessary
    };
  }

  render() {
    return (
      <div>
        <h2>{'Add notifications to goal'}</h2>
      </div>
      //   <div>
      //     <div className='modal'>
      //       <div className='modal-content'>
      //         <span className='close'>&times;</span>
      //         <h2>Child Modal</h2>
      //         <p>This is the content of the child modal.</p>
      //         <p>This is the content of the child modal.</p>
      //         <p>This is the content of the child modal.</p>

      //         <p>This is the content of the child modal.</p>
      //         <p>This is the content of the child modal.</p>

      //         <p>This is the content of the child modal.</p>
      //         <p>This is the content of the child modal.</p>
      //         <p>This is the content of the child modal.</p>
      //       </div>
      //     </div>
      //   </div>
    );
  }
  //   goalTypeForm = (props) => {
  //     return <GoalTypeForm {...props} />;
  //   };
  //   renderContent = (formProps: IFormProps) => {
  //     const goalType = this.props.goalType || ({} as IGoalType);
  //     // const { closeModal, renderButton } = this.props;
  //     // const { values, isSubmitted } = formProps;
  //     // const { contribution } = this.state;
  //     // const { specificPeriodGoals } = this.state;

  //     return (
  //       <>
  //         <h2>{'Add notifications to goal'}</h2>
  //         <p>
  //           <FormControl
  //             //   id={String(col._id)}
  //             //   defaultChecked={col.checked}
  //             componentClass='checkbox'
  //           />
  //           {__('Goal Started')}
  //         </p>
  //         <p>
  //           <FormControl
  //             //   id={String(col._id)}
  //             //   defaultChecked={col.checked}
  //             componentClass='checkbox'
  //           />
  //           {__('Goal Archieved')}
  //         </p>
  //         <p>
  //           <FormControl
  //             //   id={String(col._id)}
  //             //   defaultChecked={col.checked}
  //             componentClass='checkbox'
  //           />
  //           {__('Goal Missed')}
  //         </p>
  //         <ModalFooter>
  //           <Button btnStyle='simple' onClick={this.goalTypeForm} icon='cancel-1'>
  //             {__('back')}
  //           </Button>
  //           <Button btnStyle='simple' icon='cancle-1'>
  //             {__('Save Changes')}
  //           </Button>
  //         </ModalFooter>
  //       </>
  //     );
  //   };

  //   render() {
  //     return <Form renderContent={this.renderContent} />;
  //   }
}

export default GoalNotification;
