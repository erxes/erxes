import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import ConfirmDialog from '../../../modules/common/components/ConfirmDialog';

describe('ConfirmDialog component', () => {
  const defaultProps = {
    options: {
      okLabel: 'string',
      cancelLabel: 'string',
      enableEscape: false
    },
    confirmation: 'yes',
    proceed: () => null,
    dismiss: () => null
  };

  test('renders successfully', () => {
    shallow(<ConfirmDialog {...defaultProps} />);
  });
});
