import React from 'react';
import { DefaultWrapper } from '../../common/utils';
import { subMenu } from '../../common/constants';
import {
  BarItems,
  Button,
  HeaderDescription,
  ModalTrigger,
  __
} from '@erxes/ui/src';
import Form from '../containers/Form';
import { Link } from 'react-router-dom';

type Props = {
  list: any[];
  totalCount: number;
};

class List extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderForm() {
    const trigger = <Button btnStyle="success">{__('Add Plan')}</Button>;

    const content = ({ closeModal }) => <Form closeModal={closeModal} />;

    return (
      <ModalTrigger
        title="Add Plan"
        size="xl"
        content={content}
        trigger={trigger}
      />
    );
  }

  renderContent() {
    return <></>;
  }

  render() {
    const { totalCount } = this.props;

    const leftActionBar = (
      <HeaderDescription
        title="Plans"
        icon="/images/actions/16.svg"
        description=""
      />
    );

    const rightActionBar = (
      <BarItems>
        <Button btnStyle="success">
          <Link to={`/settings/risk-assessment-plans/add`}>
            {__('Add Plan')}
          </Link>
        </Button>
      </BarItems>
    );

    const updatedProps = {
      title: 'Plans',
      content: this.renderContent(),
      totalCount,
      rightActionBar,
      leftActionBar,
      subMenu
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
