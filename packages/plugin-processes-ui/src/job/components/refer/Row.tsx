import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import { FormControl } from '@erxes/ui/src/components/form';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';

import ProductForm from '../../containers/refer/Form';
import { IJobRefer } from '../../types';

type Props = {
  jobRefer: IJobRefer;
  history: any;
  isChecked: boolean;
  toggleBulk: (jobRefer: IJobRefer, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { jobRefer, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(jobRefer, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const renderFormTrigger = (trigger: React.ReactNode, job?: IJobRefer) => {
      const content = props => <ProductForm {...props} jobRefer={job} />;

      return (
        <ModalTrigger
          size="lg"
          title="Add JOB"
          trigger={trigger}
          content={content}
        />
      );
    };

    const renderEditAction = (job: IJobRefer) => {
      const trigger = (
        <Button btnStyle="link">
          <Tip text={__('Edit')} placement="bottom">
            <Icon icon="edit" />
          </Tip>
        </Button>
      );

      return renderFormTrigger(trigger, job);
    };

    const { code, name, type, needProducts, resultProducts } = jobRefer;

    return (
      <tr>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{name}</td>
        <td>{code}</td>
        <td>
          <TextInfo>{type}</TextInfo>
        </td>
        <td>{(needProducts || []).length}</td>
        <td>{(resultProducts || []).length}</td>
        <td>{renderEditAction(jobRefer)}</td>
      </tr>
    );
  }
}

export default Row;
