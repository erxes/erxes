import type { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { classifyError } from '../errorClassifier';

/**
 * Apollo Server plugin that handles expected errors
 * 
 * Features:
 * - Overrides HTTP status to 200 when all errors are EXPECTED business errors
 * - Adds error category metadata to GraphQL error extensions
 * - Allows frontend to distinguish business errors from system errors
 */
export const expectedErrorPlugin: ApolloServerPlugin = {
  async requestDidStart(): Promise<GraphQLRequestListener> {
    return {
      async willSendResponse(requestContext) {
        const { response } = requestContext;
        
        // Check if response has errors
        if (response.body.kind !== 'single' || !response.body.singleResult.errors) {
          return;
        }

        const errors = response.body.singleResult.errors;
        if (!errors || errors.length === 0) {
          return;
        }

        // Classify each error
        const classifications = errors.map(error => {
          const originalError = error.originalError || error;
          return classifyError(originalError);
        });

        // Enrich error extensions with category metadata
        errors.forEach((error, index) => {
          const classification = classifications[index];
          
          if (!error.extensions) {
            error.extensions = {};
          }

          error.extensions.category = classification.category;
          error.extensions.isExpected = classification.isExpected;
          error.extensions.statusCode = classification.statusCode;
        });

        // If ALL errors are expected, override HTTP status to 200
        const allExpected = classifications.every(c => c.category === 'EXPECTED');
        
        if (allExpected && response.http) {
          response.http.status = 200;
        }
      },
    };
  },
};
