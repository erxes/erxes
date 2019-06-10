import { mount, shallow } from 'enzyme';
import * as React from 'react';
import DealSelect from '../../../modules/deals/components/DealSelect';
import { IBoard, IPipeline, IStage } from '../../../modules/deals/types';

describe('DealSelect component', () => {
  const testBoards: IBoard[] = [
    {
      _id: 'qwe124',
      name: 'qwertu'
    },
    {
      _id: 'qwe123',
      name: 'qwerty'
    }
  ];

  const testPipeline: IPipeline[] = [
    {
      _id: 'q123',
      name: 'John'
    },
    {
      _id: 'asd123',
      name: 'Kate'
    }
  ];

  const testStage: IStage[] = [
    {
      _id: 'w123',
      dealsTotalCount: 231
    },
    {
      _id: 'q123',
      dealsTotalCount: 123
    }
  ];

  const defaultProps = {
    boards: testBoards,
    pipelines: testPipeline,
    stages: testStage,
    onChangeBoard: (value: string) => null,
    onChangePipeline: (value: string) => null,
    onChangeStage: (value: string, callback?: () => void) => null
  };

  test('renders successfully', () => {
    shallow(<DealSelect {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<DealSelect {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
