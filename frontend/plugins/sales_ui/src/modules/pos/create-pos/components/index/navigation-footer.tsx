import React from 'react';
import { Button } from 'erxes-ui';
import { IconLoader2 } from '@tabler/icons-react';
import { NavigationFooterProps } from '@/pos/pos-detail/types/IPosLayout';
import { ValidationAlert } from './lay-stepper';

export const NavigationFooter = React.memo(
  ({
    prevStep,
    nextStep,
    handlePrevStep,
    handleNextStep,
    isLastStep,
    isLoading = false,
    validationError = null,
    isSubmitting = false,
  }: NavigationFooterProps) => (
    <div className="flex sticky bottom-0 flex-col p-4 border-t bg-background">
      {validationError && <ValidationAlert message={validationError} />}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevStep}
          disabled={!prevStep || isLoading || isSubmitting}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={(!nextStep && !isLastStep) || isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? (
            <span className="flex gap-2 items-center">
              <IconLoader2 className="w-4 h-4 animate-spin" />
              {isLastStep ? 'Saving...' : 'Loading...'}
            </span>
          ) : isLastStep ? (
            'Save POS'
          ) : (
            'Next step'
          )}
        </Button>
      </div>
    </div>
  ),
);
