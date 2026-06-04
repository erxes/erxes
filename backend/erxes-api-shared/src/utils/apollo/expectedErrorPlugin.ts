import type { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { classifyError, IClassificationResult } from '../errorClassifier';
import * as Sentry from '@sentry/node';

/**
 * Apollo Server plugin that handles expected errors
 * 
 * Features:
 * - Overrides HTTP status to 200 when all errors are EXPECTED business errors
 * - Adds error category metadata to GraphQL error extensions
 * - Allows frontend to distinguish business errors from system errors
 * - Captures unhandled system/provider errors in Sentry (e.g., GraphQL validation, syntax)
 */
export const expectedErrorPlugin: ApolloServerPlugin = {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    // Store classifications from didEncounterErrors to use in willSendResponse
    const errorClassifications = new Map<string, IClassificationResult>();

    return {
      async didEncounterErrors(requestContext) {
        // Capture original GraphQL errors with their full context
        for (const error of requestContext.errors) {
          const originalError = error.originalError || error;
          const classification = classifyError(originalError);
          
          // Use error path as key to match in willSendResponse
          const pathKey = error.path 
            ? error.path.join('.') 
            : error.message;
          errorClassifications.set(pathKey, classification);

          // Capture in Sentry if it's a system/provider error and hasn't been captured yet
          // (Resolver errors are usually captured by withSentryCapture in wrapperResolvers)
          if (classification.category !== 'EXPECTED' && !(originalError as any)._sentryCaptured) {
            (originalError as any)._sentryCaptured = true;
            
            Sentry.withScope((scope) => {
              scope.setTag('graphql.operation', requestContext.operation?.operation || 'unknown');
              scope.setTag('graphql.operationName', requestContext.operationName || 'unknown');
              scope.setTag('error.category', classification.category);
              
              const contextValue = requestContext.contextValue as any;
              scope.setContext('graphql', {
                path: pathKey,
                operation: requestContext.operation?.operation,
                operationName: requestContext.operationName,
                subdomain: contextValue?.subdomain,
                userId: contextValue?.user?._id,
                errorCategory: classification.category,
              });
              
              Sentry.captureException(originalError);
            });
          }
        }
      },

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

        // Classify each error using stored classifications from didEncounterErrors
        const classifications: IClassificationResult[] = errors.map(error => {
          const pathKey = error.path 
            ? error.path.join('.') 
            : error.message;
          
          // Use pre-computed classification from didEncounterErrors if available
          const stored = errorClassifications.get(pathKey);
          if (stored) {
            return stored;
          }
          
          // Fallback: classify from the formatted error message
          return classifyError(error.message);
        });

        // Enrich error extensions with category metadata
        errors.forEach((error, index) => {
          const classification = classifications[index];
          
          if (!error.extensions) {
            (error as any).extensions = {};
          }

          (error as any).extensions.category = classification.category;
          (error as any).extensions.isExpected = classification.isExpected;
          (error as any).extensions.statusCode = classification.statusCode;
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
