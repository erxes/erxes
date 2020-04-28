import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IFormProps } from 'modules/common/types';
import CommonForm from 'modules/settings/common/components/Form';
import { ICommonFormProps } from 'modules/settings/common/types';
import React from 'react';
import { IDashboard } from '../types';

type Props = {
  object?: IDashboard;
} & ICommonFormProps;

class DashboardForm extends React.Component<Props & ICommonFormProps> {
  generateDoc = (values: { _id?: string; name: string }) => {
    const { object } = this.props;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name
    };
  };

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as IDashboard);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    return (
      <CommonForm
        {...this.props}
        name="dashboard"
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={this.props.object}
      />
    );
  }
}

export default DashboardForm;
