// import FormControl from 'modules/common/components/form/Control';
// import FormGroup from 'modules/common/components/form/Group';
// import ControlLabel from 'modules/common/components/form/Label';
// import { IFormProps } from 'modules/common/types';
// import CommonForm from 'modules/settings/common/components/Form';
// import { ICommonFormProps } from 'modules/settings/common/types';
// import React from 'react';

// type Props = {
//   object?: any;
// } & ICommonFormProps;

// class DashboardForm extends React.Component<Props & ICommonFormProps> {
//   generateDoc = (values: { _id?: string; name: string }) => {
//     const { object } = this.props;
//     const finalValues = values;

//     if (object) {
//       finalValues._id = object._id;
//     }

//     return {
//       _id: finalValues._id,
//       name: finalValues.name
//     };
//   };

//   renderContent = (formProps: IFormProps) => {
//     const object = this.props.object || ({} as any);

//     return (
//       <>
//         <FormGroup>
//           <ControlLabel required={true}>Name</ControlLabel>
//           <FormControl
//             {...formProps}
//             name="name"
//             defaultValue={object.name}
//             type="text"
//             required={true}
//             autoFocus={true}
//           />
//         </FormGroup>
//       </>
//     );
//   };

//   render() {
//     return (
//       <CommonForm
//         {...this.props}
//         name="dashboard"
//         renderContent={this.renderContent}
//         generateDoc={this.generateDoc}
//         object={this.props.object}
//       />
//     );
//   }
// }

// export default DashboardForm;
// //

import { IBoard } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';

type Props = {
  board: IBoard;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  type: string;
  history: any;
};

class BoardForm extends React.Component<Props, {}> {
  generateDoc = (values: { _id?: string; name: string }) => {
    const { board, type } = this.props;
    const finalValues = values;

    if (board) {
      finalValues._id = board._id;
    }

    return {
      ...finalValues,
      type
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { board, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;
    const object = board || { name: '' };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'board',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: board
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default BoardForm;
