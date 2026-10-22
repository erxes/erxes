import { fireEvent, render, screen } from '@testing-library/react';
import { ProviderCatalog } from '../components/ProviderCatalog';
import { templates } from './fixtures';

describe('provider catalog', () => {
  it('shows real providers, hides generic vault templates, and passes the exact chosen template', () => {
    const choose = jest.fn();
    render(<ProviderCatalog templates={templates} onChoose={choose} />);
    expect(screen.queryByText('Generic')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Cloudflare R2/ }));
    expect(choose).toHaveBeenCalledWith(templates[2]);
    const logo = screen
      .getByRole('button', { name: /OpenAI/ })
      .querySelector('img');
    expect(logo?.getAttribute('src')).toBe('/assets/openai.webp');
  });

  it('filters by category and search and provides a working recovery from empty results', () => {
    render(<ProviderCatalog templates={templates} onChoose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Email', exact: true }));
    expect(screen.getByRole('button', { name: /SMTP/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /OpenAI/ })).toBeNull();
    fireEvent.change(screen.getByLabelText('Search providers'), {
      target: { value: 'not-a-provider' },
    });
    expect(screen.getByText('No providers found')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('button', { name: /OpenAI/ })).toBeTruthy();
  });

  it('does not allow read-only users to open a setup flow', () => {
    render(<ProviderCatalog templates={templates} />);
    expect(
      screen.getByRole('button', { name: /OpenAI/ }).hasAttribute('disabled'),
    ).toBe(true);
  });
});
