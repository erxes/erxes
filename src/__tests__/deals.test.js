/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { DealMoveForm } from 'modules/deals/components';

const context = { __: value => value };

describe('Deals', () => {
  const stageId = 'stageId';

  describe('Deal move form', () => {
    test('Renders without crashing', () => {
      shallow(<DealMoveForm stageId={stageId} />, { context });
    });

    test('Renders without crashing', () => {
      const wrapper = shallow(<DealMoveForm />, { context });

      console.log('wrapper: ', wrapper.text());
    });
  });
});
