import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { IButtonMutateProps, ICommonListProps } from 'modules/common/types';
import React from 'react';
import { Actions, Template, TemplateBox, Templates } from '../styles';
import DashboardForm from './DashboardForm';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
} & ICommonListProps;

class DashboardList extends React.Component<Props> {
  renderForm = props => {
    return <DashboardForm {...props} renderButton={this.props.renderButton} />;
  };

  removeTemplate = object => {
    this.props.remove(object._id);
  };

  renderEditAction = object => {
    const { save } = this.props;

    const content = props => {
      return this.renderForm({ ...props, object, save });
    };

    return (
      <ModalTrigger
        enforceFocus={false}
        title="Edit"
        size="lg"
        trigger={
          <div>
            <Icon icon="edit" /> Edit
          </div>
        }
        content={content}
      />
    );
  };

  onTrClick = object => {
    const { history } = this.props;

    history.push(`/dashboard/details/${object._id}`);
  };

  renderRow({ objects }) {
    return objects.map((object, index) => (
      <Template key={index} onClick={() => this.onTrClick(object)}>
        <TemplateBox>
          <Actions>
            {this.renderEditAction(object)}
            <div onClick={this.removeTemplate.bind(this, object)}>
              <Icon icon="cancel-1" /> Delete
            </div>
          </Actions>
        </TemplateBox>
        <h5>{object.name}</h5>
      </Template>
    ));
  }

  renderContent = props => {
    return <Templates>{this.renderRow(props)}</Templates>;
  };

  render() {
    const trigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        xaxax
      </Button>
    );
    return (
      <div>
        <ModalTrigger
          title={'Dashboard'}
          // size={size}
          enforceFocus={false}
          trigger={trigger}
          autoOpenKey="showListFormModal"
          content={this.renderForm}
          dialogClassName="transform"
        />
        {this.renderContent(this.props)}
      </div>
    );
  }
}

export default DashboardList;
