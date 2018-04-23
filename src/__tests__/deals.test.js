/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import {
  Home,
  Board,
  Pipeline,
  Stage,
  Deal,
  DealAddForm,
  DealEditForm,
  DealMove,
  DealSelect,
  ProductSection,
  ProductForm,
  ProductItemForm,
  CommonDeal,
  DealSection,
  Items,
  UserCounter
} from 'modules/deals/components';

import { Sidebar, Tab, Top } from 'modules/deals/components/deal/editForm';

describe('Deals', () => {
  const context = {
    __: value => value,
    closeModal: () => {}
  };

  const deal = { _id: 'dealId:', name: 'Deal 1' };

  describe('Render components', () => {
    test('Rendering home', () => {
      shallow(<Home />, { context });
    });

    test('Rendering board', () => {
      shallow(<Board />, { context });
    });

    test('Rendering pipeline', () => {
      const pipeline = { _id: 'pipelineId', name: 'Pipelne 1' };

      shallow(<Pipeline pipeline={pipeline} />);
    });

    test('Rendering stage', () => {
      const stage = { _id: 'stageId', name: 'Stage 1' };

      shallow(<Stage stage={stage} />);
    });

    test('Rendering deal', () => {
      shallow(<Deal deal={deal} />);
    });

    test('Rendering common deal', () => {
      shallow(<CommonDeal deal={deal} />);
    });

    test('Rendering deal add form', () => {
      shallow(<DealAddForm />, { context });
    });

    test('Rendering deal edit form', () => {
      shallow(<DealEditForm deal={deal} />, { context });
    });

    test('Rendering deal move', () => {
      shallow(<DealMove deal={deal} />, { context });
    });

    test('Rendering deal select', () => {
      shallow(<DealSelect />, { context });
    });

    test('Rendering product section', () => {
      shallow(<ProductSection onChangeProductsData={() => {}} />, { context });
    });

    test('Rendering product form', () => {
      shallow(<ProductForm onChangeProductsData={() => {}} />, { context });
    });

    test('Rendering product item', () => {
      const productData = { _id: '_id' };

      shallow(<ProductItemForm productData={productData} />, { context });
    });

    test('Rendering deal section', () => {
      shallow(<DealSection />, { context });
    });

    test('Rendering items', () => {
      shallow(<Items />);
    });

    test('Rendering user counter', () => {
      shallow(<UserCounter />);
    });

    test('Rendering sidebar', () => {
      shallow(<Sidebar deal={deal} />);
    });

    test('Rendering tab', () => {
      shallow(<Tab deal={deal} />, { context });
    });

    test('Rendering top', () => {
      shallow(<Top deal={deal} />, { context });
    });
  });
});
