import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { PostizPublishSheet } from '../src/modules/cms/posts/postiz/PostizPublishSheet';

void i18next.use(initReactI18next).init({
  lng: 'en',
  resources: {},
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});
const mode = new URLSearchParams(location.search).get('mode');
if (new URLSearchParams(location.search).has('dark'))
  document.documentElement.classList.add('dark');
let enabled = mode !== 'disabled';
let attempts = 0;
let validations = 0;
const requests: unknown[] = [];
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const timer = setTimeout(
          () => {
            const name = operation.operationName;
            if (mode === 'error' && name === 'CmsSocialOptions') {
              observer.error(new Error('Synthetic unavailable service'));
              return;
            }
            let data: Record<string, unknown>;
            if (name === 'CmsSocialOptions')
              data = {
                cmsPostizOptions: {
                  enabled,
                  canManage: true,
                  channels:
                    mode === 'empty'
                      ? []
                      : [
                          {
                            id: 'test-facebook',
                            name: 'Preview Facebook Page',
                            provider: 'facebook',
                            usable: true,
                          },
                          {
                            id: 'test-instagram',
                            name: 'Preview Instagram account',
                            provider: 'instagram',
                            usable: false,
                          },
                        ],
                },
              };
            else if (name === 'CmsSocialEnable') {
              enabled = true;
              data = { cmsPostizEnable: true };
            } else if (name === 'CmsSocialValidate') {
              validations++;
              if (mode === 'validation' && validations === 1) {
                observer.error(new Error('Synthetic caption validation error'));
                return;
              }
              data = { cmsPostizValidate: true };
            } else if (name === 'CmsSocialShare') {
              requests.push(operation.variables.input);
              attempts++;
              document.querySelector('[data-requests]')!.textContent =
                JSON.stringify(requests);
              if (mode === 'retry' && attempts === 1) {
                observer.error(new Error('Synthetic lost response'));
                return;
              }
              data = {
                cmsPostizShare: [
                  {
                    __typename: 'CmsPostizDelivery',
                    _id: 'test-delivery',
                    postId: 'test-post',
                    channelName: 'Preview Facebook Page',
                    state: 'QUEUED',
                    url: null,
                    message: null,
                  },
                ],
              };
            } else
              data = {
                cmsPostizDeliveries: [
                  {
                    __typename: 'CmsPostizDelivery',
                    _id: 'test-delivery',
                    postId: 'test-post',
                    channelName: 'Preview Facebook Page',
                    state: mode === 'failed' ? 'FAILED' : 'QUEUED',
                    url: null,
                    message: null,
                  },
                ],
              };
            observer.next({ data });
            observer.complete();
          },
          mode === 'loading' ? 10000 : 100,
        );
        return () => clearTimeout(timer);
      }),
  ),
});

function Preview() {
  const [open, setOpen] = useState(false);
  const [saves, setSaves] = useState(0);
  return (
    <ApolloProvider client={client}>
      <main className="p-6 text-foreground bg-background min-h-screen">
        <h1 className="text-xl">CMS sharing component preview</h1>
        <p>Synthetic data only. This preview cannot publish anything.</p>
        <button className="min-h-11 underline" onClick={() => setOpen(true)}>
          Open publish sheet
        </button>
        <p>
          CMS saves: <span data-saves>{saves}</span>
        </p>
        <pre data-requests className="whitespace-pre-wrap break-all" />
        {open && (
          <PostizPublishSheet
            websiteId="test-cms"
            language="en"
            initialCaption="Preview article caption"
            images={[]}
            save={async () => {
              setSaves((count) => count + 1);
              return 'test-post';
            }}
            onClose={() => setOpen(false)}
          />
        )}
      </main>
    </ApolloProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
