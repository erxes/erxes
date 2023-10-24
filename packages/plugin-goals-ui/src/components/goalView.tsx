// import { gql, useQuery, useMutation } from '@apollo/client';
// import { Alert, confirm } from '@erxes/ui/src/utils';
// import {
//   mutations,
//   queries
// } from '@erxes/ui-cards/src/settings/boards/graphql';
// import Button from '@erxes/ui/src/components/Button';
// import Icon from '@erxes/ui/src/components/Icon';
// import { LinkButton } from '@erxes/ui/src/styles/main';
// import Modal from 'react-bootstrap/Modal';
// import { __ } from 'coreui/utils';
// import { FormControl } from '@erxes/ui/src/components/form';
// import Table from '@erxes/ui/src/components/table';
// import { IGoal, IGoalTypeDoc, IAssignmentCampaign } from '../types';
// import * as path from 'path';

// import {
//   ControlLabel,
//   Form,
//   DateControl,
//   MainStyleFormColumn as FormColumn,
//   FormGroup,
//   MainStyleFormWrapper as FormWrapper,
//   MainStyleModalFooter as ModalFooter,
//   MainStyleScrollWrapper as ScrollWrapper
// } from '@erxes/ui/src';
// import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
// import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
// import { ENTITY, CONTRIBUTION, FREQUENCY, GOAL_TYPE } from '../constants';

// import { DateContainer } from '@erxes/ui/src/styles/main';
// import dayjs from 'dayjs';
// import client from '@erxes/ui/src/apolloClient';
// import { IPipelineLabel } from '@erxes/ui-cards/src/boards/types';
// import { queries as pipelineQuery } from '@erxes/ui-cards/src/boards/graphql';
// import { isEnabled } from '@erxes/ui/src/utils/core';
// import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
// import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';

// import styled from 'styled-components';
// import { TabTitle, Tabs as MainTabs } from '@erxes/ui/src';

// import { ModalTrigger } from '@erxes/ui/src';
// import GoalTypeForm from './goalTypeForm';
// type Props = {
//   _id: any;
// };
// // tslint:disable-next-line:class-name
// type State = {};
// // tslint:disable-next-line:class-name

// import React, { Component } from 'react';

// class GoalView extends Component<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     const { _id = {} } = props;
//     console.log(_id, 'goalTypeView');
//     this.state = {
//       // Initialize your state here if necessary
//     };
//   }

//   render() {
//     return (
//       <div>
//         <h2>{'GoalView'}</h2>
//       </div>
//     );
//   }
// }

// export default GoalView;

import React, { useState, useEffect } from 'react';
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

function GoalView() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [costMutation] = useMutation(gql(mutations.costAdd));
  const { data, loading } = useQuery(gql(queries.costs));
  //   useEffect(() => {
  //     if (data) {
  //       setElements(data.costs);
  //     }
  //   }, [data]);

  //   const [inputValues, setInputValues] = useState({
  //     _id: '',
  //     name: '',
  //     code: ''
  //   });

  //   const addElement = () => {
  //     const newElement = {
  //       _id: Math.random().toString(),
  //       code: inputValues.code,
  //       name: inputValues.name
  //     };
  //     setElements((prevElements) => [...prevElements, newElement]);
  //     setInputValues({
  //       _id: '',
  //       code: '',
  //       name: ''
  //     });
  //   };

  //   const changeElement = (index, newValue1, newValue2) => {
  //     const updatedElements = [...elements];
  //     updatedElements[index] = {
  //       _id: elements[index]._id,
  //       code: newValue1,
  //       name: newValue2
  //     };
  //     setElements(updatedElements);
  //   };

  //   const deleteElement = (index) => {
  //     const updatedElements = [...elements];
  //     updatedElements.splice(index, 1);
  //     setElements(updatedElements);
  //   };

  //   const handleSubmit = (event) => {
  //     const setData = elements.map((element, index) => {
  //       if (element.name === '' || element.code === '') {
  //         Alert.error('Please fill all fields');
  //         throw new Error('Please fill all fields');
  //       }
  //       return {
  //         name: element.name,
  //         code: element.code,
  //         _id: element._id
  //       };
  //     });
  //     event.preventDefault();
  //     confirm().then(() => {
  //       costMutation({ variables: { costObjects: setData } })
  //         .then(() => {
  //           Alert.success('Successfully created');
  //           handleClose();
  //         })
  //         .catch((e) => {
  //           Alert.error(e.message);
  //         });
  //     });
  //   };

  return (
    <div className="container">
      <h1>Deals Progress Report</h1>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Target</th>
            <th>Current</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Aug 2023</td>
            <td>10</td>
            <td>11</td>
            <td>110%</td>
          </tr>
          {/* Add more rows for other months */}
        </tbody>
      </table>
    </div>
  );

  //   return (

  //     // <>
  //     //   <Table whiteSpace='nowrap' hover={true}>
  //     //     <thead>
  //     //       <tr>
  //     //         <th>{__('Code')}</th>
  //     //         <th>{__('Name')}</th>
  //     //         <th>{__('Action')}</th>
  //     //       </tr>
  //     //     </thead>
  //     //   </Table>
  //     // </>
  //   );
}

export default GoalView;
