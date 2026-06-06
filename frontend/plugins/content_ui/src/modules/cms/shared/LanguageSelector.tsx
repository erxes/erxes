import { Form, Select } from 'erxes-ui';

interface LanguageOption {
  value: string;
  label: string;
  isDefault: boolean;
  hasTranslation: boolean;
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  languageOptions: LanguageOption[];
  onLanguageChange: (lang: string) => void;
}

export const LanguageSelector = ({
  selectedLanguage,
  languageOptions,
  onLanguageChange,
}: LanguageSelectorProps) => (
  <Form.Item>
    <Form.Label>Language</Form.Label>
    <Form.Control>
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {languageOptions.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
              {option.isDefault && (
                <span className="ml-2 text-xs text-gray-500">(Default)</span>
              )}
              {option.hasTranslation && (
                <span className="ml-2 text-green-600">&#10003;</span>
              )}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Form.Control>
  </Form.Item>
);
