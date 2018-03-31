/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { Board, Pipeline, Stage, ItemCounter } from 'modules/deals/components';

const context = { __: value => value };

describe('Deals', () => {
  describe('Render components', () => {
    test('Rendering board', () => {
      shallow(<Board />, { context });
    });

    test('Render board when no currentBoard', () => {
      const wrapper = shallow(<Board />, { context });

      expect(wrapper.find('Wrapper').length).toEqual(1);
    });

    test('Render board when no currentBoard', () => {
      const currentBoard = { _id: 'id 1', name: 'board 1' };

      const wrapper = shallow(<Board currentBoard={currentBoard} />, {
        context
      });

      expect(wrapper.find('Wrapper').length).toEqual(1);
    });

    test('Rendering pipeline', () => {
      const pipeline = { _id: 'pipelineId:', name: 'Pipelne 1' };

      shallow(<Pipeline pipeline={pipeline} />);
    });

    test('Rendering stage', () => {
      const stage = { _id: 'stageId:', name: 'Stage 1' };

      shallow(<Stage stage={stage} />);
    });
  }),
    describe('ItemCounter', () => {
      test('Renders empty when no items', () => {
        const wrapper = shallow(<ItemCounter />, { context });

        expect(wrapper.isEmptyRender()).toBeTruthy();
      });

      test('Renders empty when items length is zero', () => {
        const wrapper = shallow(<ItemCounter items={[]} />, { context });

        expect(wrapper.isEmptyRender()).toBeTruthy();
      });

      test('Count li', () => {
        const items = [
          { _id: 'id 1', name: 'name 1' },
          { _id: 'id 2', name: 'name 2' },
          { _id: 'id 3', name: 'name 3' },
          { _id: 'id 4', name: 'name 4' }
        ];

        const wrapper = shallow(<ItemCounter items={items} show />, {
          context
        });

        expect(wrapper.find('li').length).toEqual(4);

        wrapper.setState({ show: false });

        expect(wrapper.find('li').length).toEqual(2);
        expect(wrapper.find('.remained-count').text()).toBe('+3');

        wrapper.setProps({ items: [{ _id: 'id 1', name: 'name 1' }] });

        expect(wrapper.find('li').length).toEqual(1);
      });
    });
});
