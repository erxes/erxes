// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import 'erxes-ui/styles.css';

const link = document.createElement('link');
link.href =
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=Roboto+Mono:wght@100..700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

document.body.style.fontSize = '14px';

const withApolloMockProvider = (Story: any, context: any) => {
  return (
    <MockedProvider mocks={context.parameters.mocks || []} addTypename={false}>
      <Story />
    </MockedProvider>
  );
};

const preview: Preview = {
  decorators: [withApolloMockProvider],
};

export default preview;
