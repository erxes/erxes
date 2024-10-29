import {
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __
} from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import Form from '../containers/Form';
type Props = {
  queryParams: any;
  config: any;
  checked: boolean;
  selectItem: (id: string) => void;
};

type State = {};

class Row extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }
  render() {
    const { config, checked, selectItem } = this.props;

    const renderActions = () => {
      const content = ({ closeModal }) => {
        const updatedProps = {
          ...this.props,
          closeModal,
        };

        return <Form {...updatedProps} />;
      };

      const trigger = (
        <Button btnStyle="link">
          <Tip placement="bottom" text="Edit risk assessment config">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      );
      return (
        <ModalTrigger
          title={__("Edit Risk Assessment Configs")}
          trigger={trigger}
          content={content}
          size="lg"
        />
      );
    };

    return (
      <tr>
        <td>
          <FormControl
            componentclass="checkbox"
            checked={checked}
            onClick={() => selectItem(config._id)}
          />
        </td>
        <td>{__(config?.board?.name || "-")}</td>
        <td>{__(config?.pipeline?.name || "-")}</td>
        <td>{__(config?.stage?.name || "-")}</td>
        <td>{__(config?.field?.text || "-")}</td>
        <td>{__(config?.riskAssessment?.name || "-")}</td>
        <td>{moment(__(config?.createdAt)).format("ll HH:mm")}</td>
        <td>{moment(__(config?.modifiedAt)).format("ll HH:mm")}</td>
        <td>{renderActions()}</td>
      </tr>
    );
  }
}

export default Row;
