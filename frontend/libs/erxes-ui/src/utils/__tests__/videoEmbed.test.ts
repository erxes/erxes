import { getCloudflareStreamBase, parseVideoEmbedUrl } from '../videoEmbed';

describe('video embed URLs', () => {
  it.each([
    'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    'https://youtu.be/M7lc1UVf-VE?t=10',
    'https://www.youtube.com/embed/M7lc1UVf-VE',
    'https://www.youtube.com/shorts/M7lc1UVf-VE',
  ])('normalizes %s', (url) => {
    expect(parseVideoEmbedUrl(url)?.embedUrl).toBe(
      'https://www.youtube.com/embed/M7lc1UVf-VE',
    );
  });

  it('normalizes Vimeo URLs', () => {
    expect(parseVideoEmbedUrl('https://vimeo.com/123456789')?.embedUrl).toBe(
      'https://player.vimeo.com/video/123456789',
    );
  });

  it.each([
    'ftp://example.com/video.mp4',
    'https://youtube.com.evil.test/watch?v=M7lc1UVf-VE',
    'https://example.com/video.mp4',
    '',
  ])('leaves unsupported URL %s to the native player', (url) => {
    expect(parseVideoEmbedUrl(url)).toBeNull();
  });

  it('extracts the Cloudflare Stream player base', () => {
    expect(
      getCloudflareStreamBase(
        'https://customer-test.cloudflarestream.com/video-id/manifest/video.m3u8',
      ),
    ).toBe('https://customer-test.cloudflarestream.com/video-id');
  });

  it('does not embed a URL outside Cloudflare Stream', () => {
    expect(
      getCloudflareStreamBase('https://example.com/video.m3u8'),
    ).toBeNull();
  });
});
