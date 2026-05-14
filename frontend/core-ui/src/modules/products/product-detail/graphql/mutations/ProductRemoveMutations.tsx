import { gql } from '@apollo/client';

const productRemove = gql`
    mutation productsRemove($productIds: [String!]) {
        productsRemove(productIds: $productIds)
    }`

export const productsRemoveMutation = {  productRemove };