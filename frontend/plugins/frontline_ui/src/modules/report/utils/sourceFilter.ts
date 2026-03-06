type SourceType =
  | 'all'
  | 'facebook-messenger'
  | 'facebook-post'
  | 'instagram-messenger'
  | 'instagram-post'
  | 'messenger'
  | 'call'
  | 'form';

interface SourceOption {
  value: SourceType;
  label: string;
  icon?: React.ReactNode;
}

export function getSourceFilter(value: string): SourceOption {
  const sourceMap: Record<SourceType, Omit<SourceOption, 'value'>> = {
    all: { label: 'All Sources' },
    'facebook-messenger': { label: 'Facebook Messenger' },
    'facebook-post': { label: 'Facebook Post' },
    'instagram-messenger': { label: 'Instagram Messenger' },
    'instagram-post': { label: 'Instagram Post' },
    form: { label: 'Form' },
    messenger: { label: 'Messenger' },
    call: { label: 'Call' },
  };

  const normalizedValue = value.toLowerCase() as SourceType;
  const source = sourceMap[normalizedValue] || { label: value };

  return {
    value: normalizedValue,
    ...source,
  };
}
