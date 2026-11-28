import { setTimeout as sleep } from 'node:timers/promises';
import { load } from 'cheerio';
import { config } from '~/config';
import { OutboundError } from '~/lib/outbound';
import { BROWSER, getPage } from './getPage';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

const RETRY_MS = 1500;

const clean = (text: string) => text.replace(/\s+/g, ' ').trim();

const targetOf = (href: string) => {
  const link = new URL(href, 'https://duckduckgo.com');
  const target = link.pathname === '/l/' ? link.searchParams.get('uddg') : link.href;

  return target && /^https?:\/\//.test(target) ? target : null;
};

const resultsIn = (html: string, limit: number) => {
  const $ = load(html);

  return $('.result:not(.result--ad)')
    .toArray()
    .flatMap((result): SearchResult[] => {
      const link = $(result).find('.result__a').first();
      const url = targetOf(link.attr('href') ?? '');

      if (!url) return [];

      return [
        {
          title: clean(link.text()),
          url,
          snippet: clean($(result).find('.result__snippet').text()),
        },
      ];
    })
    .slice(0, limit);
};

const searchPage = async (query: string) => {
  const url = new URL(config.web.searchUrl);

  url.searchParams.set('q', query);
  url.searchParams.set('kl', 'wt-wt');

  const page = await getPage(url.href, { accept: 'text/html', userAgent: BROWSER });

  return page.status === 200 ? page.text() : null;
};

export const searchWeb = async (query: string, limit: number) => {
  const html = (await searchPage(query)) ?? (await sleep(RETRY_MS).then(() => searchPage(query)));

  if (html === null) throw new OutboundError('The search engine is busy; try again in a minute');

  return resultsIn(html, limit);
};
