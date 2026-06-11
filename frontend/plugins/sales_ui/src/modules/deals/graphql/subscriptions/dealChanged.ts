import { gql } from '@apollo/client';
import { commonListFields } from '@/deals/graphql/queries/DealsQueries';

export const DEAL_CHANGED = gql`
  subscription salesDealChanged($_id: String!) {
    salesDealChanged(_id: $_id) {
      action
      deal {
        ${commonListFields}
        description
        attachments {
          url
          name
          duration
          size
          type
        }
        departments {
          _id
          title
        }
        departmentIds
        branches {
          _id
          title
        }
        branchIds
        companies {
          _id
          primaryName
        }
        customers {
          _id
          firstName
          lastName
          email
        }
        products {
          _id
          name
          code
          type
          unitPrice
          category {
            _id
            name
          }
          vendor {
            _id
            primaryName
          }
          categoryId
        }
        productsData
        mobileAmount
        mobileAmounts
        paymentsData
        relations
        pipeline {
          _id
          name
          paymentTypes
          paymentIds
        }
        boardId
      }
    }
  }
`;
