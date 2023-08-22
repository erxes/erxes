import React from 'react'
import Button from './Button'

describe('<Button />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Button>{'hello button'}</Button>)
  })
})