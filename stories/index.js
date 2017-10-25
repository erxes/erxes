import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';

import Table from '../src/components/Table';

storiesOf('Table', module)
  .addDecorator(withKnobs)
  .add('Table', () => (
    <Table hover={boolean('hover', false)} striped={boolean('striped', false)}>
      <thead>
        <tr>
          <th>Thead</th>
          <th>Thead</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Table data</td>
          <td>Table data</td>
        </tr>
        <tr>
          <td>Table data</td>
          <td>Table data</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>Tfoot</th>
          <th>Tfoot</th>
        </tr>
      </tfoot>
    </Table>
  ));
