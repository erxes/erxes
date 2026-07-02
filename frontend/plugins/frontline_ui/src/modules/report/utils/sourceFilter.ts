type SourceType =
  | 'all'
  | 'facebook-messenger'
  | 'facebook-post'
  | 'instagram-messenger'
  | 'instagram-post'
  | 'messenger'
  | 'calls'
  | 'form';

interface SourceOption {
  value: SourceType;
  label: string;
  icon?: React.ReactNode;
}

export function getSourceFilter(value: string): SourceOption {
  const sourceMap: Record<SourceType, Omit<SourceOption, 'value'>> = {
    all: { label: 'all-sources' },
    'facebook-messenger': { label: 'facebook-messenger' },
    'facebook-post': { label: 'facebook-post' },
    'instagram-messenger': { label: 'instagram-messenger' },
    'instagram-post': { label: 'instagram-post' },
    form: { label: 'form' },
    messenger: { label: 'messenger' },
    calls: { label: 'calls' },
  };

  const normalizedValue = value.toLowerCase() as SourceType;
  const source = sourceMap[normalizedValue] || { label: value };

  return {
    value: normalizedValue,
    ...source,
  };
}
