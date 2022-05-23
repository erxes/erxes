import {
  __,
  Alert,
  Button,
  confirm,
  DropdownToggle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  ModalTrigger,
  Sidebar
} from '@erxes/ui/src';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import CarForm from '../../containers/CarForm';
import { Action, Name } from '../../styles';
import { ICar } from '../../types';
import DetailInfo from './DetailInfo';
import { IAttachment } from '@erxes/ui/src/types';
import Attachment from '@erxes/ui/src/components/Attachment';

type Props = {
  car: ICar;
  remove: () => void;
};

class BasicInfoSection extends React.Component<Props> {
  renderAction() {
    const { remove } = this.props;

    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch(error => {
          Alert.error(error.message);
        });

    return (
      <Action>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" size="medium">
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a href="#delete" onClick={onDelete}>
                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Action>
    );
  }

  renderImage = (item: IAttachment) => {
    if (!item) {
      return null;
    }

    return <Attachment attachment={item} />;
  };

  render() {
    const { Section } = Sidebar;
    const { car } = this.props;

    const content = props => <CarForm {...props} car={car} />;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{car.plateNumber}</Name>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="lg"
            content={content}
          />
        </InfoWrapper>

        {this.renderAction()}
        {this.renderImage(car.attachment)}
        <Section>
          <DetailInfo car={car} />
        </Section>
      </Sidebar.Section>
    );
  }
}

export default BasicInfoSection;
