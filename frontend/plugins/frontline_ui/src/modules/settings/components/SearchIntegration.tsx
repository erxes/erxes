import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import { Input, Spinner } from 'erxes-ui';
import React, { useId, useState, useEffect } from 'react';
import { useIntegrationContext } from '../hooks/useIntegrationContext';
import { INTEGRATIONS, OTHER_INTEGRATIONS } from '../constants/integrations';

export const SearchIntegration = () => {
  const id = useId();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setIntegrations, setOtherIntegrations } = useIntegrationContext();

  useEffect(() => {
    if (!setIntegrations || !setOtherIntegrations) return;

    if (inputValue.trim()) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const term = inputValue.toLowerCase();

        const filteredMain = Object.entries(INTEGRATIONS).filter(([, value]) =>
          value.label.toLowerCase().includes(term),
        );

        const filteredOther = Object.entries(OTHER_INTEGRATIONS).filter(
          ([, value]) => value.label.toLowerCase().includes(term),
        );

        setIntegrations(Object.fromEntries(filteredMain));
        setOtherIntegrations(Object.fromEntries(filteredOther));

        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }

    // Reset to original lists
    setIntegrations(INTEGRATIONS);
    setOtherIntegrations(OTHER_INTEGRATIONS);
    setIsLoading(false);
  }, [inputValue, setIntegrations, setOtherIntegrations]);

  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          id={id}
          className="peer ps-9 pe-9"
          placeholder="Search integrations..."
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          {isLoading ? (
            <Spinner size={'sm'} />
          ) : (
            <IconSearch size={16} aria-hidden="true" />
          )}
        </div>

        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Press to search"
          type="submit"
        >
          <IconArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
