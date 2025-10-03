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
    <div className="flex flex-col p-4 border-t sticky bottom-0 bg-white">
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
            <span className="flex items-center gap-2">
              <IconLoader2 className="h-4 w-4 animate-spin" />
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
