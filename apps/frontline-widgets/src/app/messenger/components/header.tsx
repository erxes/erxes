import { useAtom, useAtomValue } from 'jotai';
import {
  connectionAtom,
  uiOptionsAtom,
  faqCurrentViewAtom,
  faqCategoryStackAtom,
  faqArticleIdAtom,
} from '../states';
import { WelcomeMessage } from '../constants';
import { HeaderTabList } from './header-tab-list';
import { IconArrowLeft, IconChevronLeft } from '@tabler/icons-react';
import { Avatar, Button, cn, readImage, Tooltip } from 'erxes-ui';
import { cva } from 'class-variance-authority';
import { useHeader } from '../hooks/useHeader';
import { formatOnlineHours } from '@libs/formatOnlineHours';
import { LinkFavicon } from './link-favicon';
import { useMessenger } from '../hooks/useMessenger';
import { AvatarGroup } from './avatar-group';
import { ISupporter } from '../types';
import { useGetMessengerSupporters } from '../hooks/useGetMessengerSupporters';
import { useGetKnowledgeBaseTopicDetails } from '../hooks/useGetKnowledgeBaseTopicDetails';
import { SearchArticlesInput } from './faq/components/search-articles';
import { CloseButton } from './CloseButton';
import { formatOnlineHoursLabel } from '@libs/format-online-hours';

const defaultLogo = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)`;

const heroVariants = cva('min-h-40 px-5 pt-4.5 pb-12 relative', {
  variants: {
    variant: {
      // top-right white sheen + bottom-left primary glow on hero-dark
      glossy:
        'bg-[radial-gradient(120%_80%_at_88%_-10%,color-mix(in_oklch,var(--color-primary-foreground)_18%,transparent)_0%,transparent_55%),radial-gradient(80%_60%_at_10%_110%,color-mix(in_oklch,var(--color-primary)_22%,transparent)_0%,transparent_60%),linear-gradient(180deg,var(--color-hero)_0%,color-mix(in_oklch,var(--color-hero)_75%,black)_70%,color-mix(in_oklch,var(--color-hero)_60%,black)_100%)]',
      // strong primary (top-right) + destructive (bottom-left) wash
      aurora:
        'bg-[radial-gradient(60%_50%_at_80%_20%,color-mix(in_oklch,var(--color-primary)_55%,transparent)_0%,transparent_60%),radial-gradient(60%_60%_at_15%_110%,color-mix(in_oklch,var(--color-destructive)_45%,transparent)_0%,transparent_60%),linear-gradient(180deg,var(--color-hero)_0%,color-mix(in_oklch,var(--color-hero)_70%,black)_100%)]',
      // three soft blobs: primary, info, warning
      mesh: 'bg-[radial-gradient(50%_40%_at_30%_30%,color-mix(in_oklch,var(--color-primary)_35%,transparent)_0%,transparent_60%),radial-gradient(40%_30%_at_80%_60%,color-mix(in_oklch,var(--color-info)_25%,transparent)_0%,transparent_60%),radial-gradient(40%_40%_at_70%_10%,color-mix(in_oklch,var(--color-warning)_18%,transparent)_0%,transparent_60%),linear-gradient(180deg,var(--color-hero)_0%,color-mix(in_oklch,var(--color-hero)_70%,black)_100%)]',
      // plain vertical gradient on hero color
      flat: 'bg-[linear-gradient(180deg,var(--color-hero)_0%,color-mix(in_oklch,var(--color-hero)_70%,black)_100%)]',
    },
  },
  defaultVariants: {
    variant: 'glossy',
  },
});

export const Header = () => {
  const { renderHeaderContent } = useHeader();

  const render = () => {
    const content = renderHeaderContent();
    switch (content) {
      case 'hero-intro':
        return <HeaderIntro />;
      case 'header-tabs':
        return <HeaderTabs />;
      default:
        return <HeaderTabs />;
    }
  };

  return (
    <div className="flex flex-col shrink-0 grow-0 gap-4 p-4 border-b border-accent">
      {render()}
    </div>
  );
};

export const HeaderIntro = () => {
  const [connection] = useAtom(connectionAtom);
  const { messengerData } = connection.widgetsMessengerConnect || {};
  const { messages, onlineHours, showTimezone, timezone, links } =
    messengerData || {};

  const formattedHours = onlineHours
    ? formatOnlineHoursLabel(onlineHours, showTimezone, timezone)
    : null;

  return (
    <div className="flex flex-col gap-4 w-full p-4 rounded-2xl shadow-xs mx-auto bg-background">
      <div className="gap-2 flex flex-col">
        <div className="font-semibold text-foreground text-base">
          {WelcomeMessage.TITLE}
        </div>
        <div className="text-muted-foreground font-normal text-xs">
          We're available between{' '}
          {formattedHours
            ? formattedHours
            : WelcomeMessage.AVAILABILITY_MESSAGE}{' '}
        </div>
        <div className="flex flex-col gap-1">
          {links && (
            <span className="text-muted-foreground font-medium text-xs">
              Contact us for any questions or concerns.
            </span>
          )}
          <div className="flex gap-1">
            {Object.entries(links || {})?.map(([key, value]) => (
              <Tooltip.Provider key={key}>
                <Tooltip>
                  <Tooltip.Trigger>
                    <a
                      href={value as string}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkFavicon size="lg" url={value as string} />
                    </a>
                  </Tooltip.Trigger>
                  <Tooltip.Content className="flex items-center gap-2">
                    <LinkFavicon size="xs" url={value as string} />
                    {key}
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeaderTabs = () => {
  const { goBack, getCurrentTitle } = useHeader();
  return (
    <div
      role="heading"
      aria-level={1}
      className="flex items-center justify-between"
    >
      <div className="flex items-center">
        <Button
          type="button"
          role="button"
          size="icon"
          variant="ghost"
          tabIndex={0}
          aria-label="Back"
          className="flex items-center gap-2 hover:bg-transparent size-8 text-accent-foreground"
          onClick={goBack}
        >
          <IconChevronLeft className="w-4 h-4 shrink-0" />
        </Button>
        <div className="text-base font-semibold">{getCurrentTitle()}</div>
      </div>
      <HeaderTabList />
    </div>
  );
};
export const HeaderHero = () => {
  const { activeTab } = useMessenger();
  const { list: supporters } = useGetMessengerSupporters();
  const { getCurrentTitle, getCurrentEyebrow, switchToTab } = useHeader();
  const uiOptions = useAtomValue(uiOptionsAtom);
  const connection = useAtomValue(connectionAtom);
  const { messengerData } = connection.widgetsMessengerConnect;
  const { knowledgeBaseTopicId, messages, isOnline } = messengerData || {};
  const { title, details } = useGetKnowledgeBaseTopicDetails({
    variables: { _id: knowledgeBaseTopicId },
    skip: !knowledgeBaseTopicId,
  });

  const faqView = useAtomValue(faqCurrentViewAtom);
  const categoryStack = useAtomValue(faqCategoryStackAtom);
  const articleId = useAtomValue(faqArticleIdAtom);
  const [, setCategoryStack] = useAtom(faqCategoryStackAtom);
  const [, setArticleId] = useAtom(faqArticleIdAtom);

  const currentCategoryId = categoryStack[categoryStack.length - 1];
  const currentCategory =
    details?.categories?.find((c) => c._id === currentCategoryId) ||
    details?.parentCategories?.find((c) => c._id === currentCategoryId);

  // Find parent category for article breadcrumb
  const articleCategoryId = articleId
    ? details?.categories
        ?.flatMap((c) => c.articles || [])
        .find((a) => a._id === articleId)?.categoryId ??
      details?.parentCategories
        ?.flatMap((c) => c.articles || [])
        .find((a) => a._id === articleId)?.categoryId
    : null;
  const articleParentCategory =
    details?.categories?.find((c) => c._id === articleCategoryId) ||
    details?.parentCategories?.find((c) => c._id === articleCategoryId) ||
    currentCategory;

  const handleFaqBack = () => {
    if (faqView === 'article') {
      setArticleId(null);
    } else if (faqView === 'category') {
      setCategoryStack((prev) => prev.slice(0, -1));
    }
  };

  if (activeTab === 'default') {
    return (
      <div
        className={cn(
          heroVariants({ variant: uiOptions?.heroStyleVariant }),
          'flex-auto',
        )}
      >
        <div className="flex items-center gap-4">
          <span className="flex-1">
            {uiOptions?.logo && uiOptions?.logo?.length > 0 ? (
              <div className="bg-foreground/5 size-8 rounded flex items-center justify-center p-1">
                <img
                  alt="logo"
                  src={readImage(uiOptions?.logo)}
                  className="object-center object-scale-down"
                />
              </div>
            ) : (
              <div
                className="size-8"
                style={{
                  backgroundImage: defaultLogo,
                  backgroundSize: '24px',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}
          </span>
          <AvatarGroup
            max={2}
            size="xl"
            className="outline-transparent flex-none"
          >
            {supporters?.map((supporter: ISupporter) => (
              <Avatar
                key={supporter._id}
                className="outline-1 outline-transparent"
                size="xl"
              >
                <Avatar.Image
                  src={readImage(supporter.details.avatar)}
                  alt={
                    supporter.details.fullName || supporter.details.firstName
                  }
                />
                <Avatar.Fallback>
                  {supporter.details.firstName?.charAt(0) || 'S'}
                </Avatar.Fallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <CloseButton />
        </div>
        <div className="mt-11">
          <h1 className="text-primary-foreground text-[30px] tracking-tight leading-none">
            {messages?.greetings?.title ?? 'How can we help?'}
          </h1>
          <span className="text-primary-foreground/60 text-[19px] -tracking-[0.015em] leading-none font-light">
            {messages?.greetings?.message ?? 'Hello there'}
          </span>
          {(isOnline && (
            <div className="mt-3 rounded-2xl py-1.75 ps-2.5 pe-3 flex-none w-auto bg-success/16 flex items-center gap-1.5 border border-success/30">
              <div className="rounded-full bg-success size-1.5 flex-none" />
              <span className="flex-1 overflow-x-hidden">
                <span className="flex tracking-tight text-xs font-medium leading-snug text-primary-foreground text-justify">
                  {messages?.welcome ?? 'Got any problems'}
                </span>
              </span>
            </div>
          )) || (
            <div className="mt-3 rounded-2xl py-1.75 ps-2.5 pe-3 flex-none w-auto bg-warning/16 flex items-center gap-1.5 border border-warning/30">
              <div className="rounded-full bg-warning size-1.5 flex-none" />
              <span className="flex-1 overflow-x-hidden">
                <span className="flex tracking-tight text-xs font-medium leading-snug text-primary-foreground text-justify">
                  {messages?.away ?? 'Please contact during operating hours'}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // FAQ: category detail header — tall gradient with category title + description
  if (activeTab === 'faq' && faqView === 'category' && currentCategory) {
    return (
      <div className="pb-[22px] px-5 pt-[18px] bg-(--color-hero) flex-none relative">
        <span className="flex items-center justify-between">
          <button
            onClick={handleFaqBack}
            className="text-primary-foreground/70 hover:text-primary-foreground mb-3 flex items-center -ml-1 transition-colors"
            aria-label="Go back"
          >
            <IconArrowLeft size={20} />
          </button>
          <CloseButton />
        </span>
        <h1 className="text-primary-foreground text-2xl font-bold leading-tight">
          {currentCategory.title}
        </h1>
        {currentCategory.description && (
          <p className="text-primary-foreground/70 text-sm mt-1 line-clamp-1 truncate">
            {currentCategory.description}
          </p>
        )}
      </div>
    );
  }

  // FAQ: article view header — compact bar with breadcrumb
  if (activeTab === 'faq' && faqView === 'article') {
    return (
      <div className="pb-[22px] px-5 pt-[18px] bg-(--color-hero) flex-none relative flex items-center justify-between">
        <button
          onClick={handleFaqBack}
          className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          aria-label="Go back"
        >
          <IconArrowLeft size={18} />
          {articleParentCategory && (
            <span className="text-sm font-medium">
              {articleParentCategory.title}
            </span>
          )}
        </button>
        <CloseButton />
      </div>
    );
  }

  // FAQ: topic view header — tall gradient with title + search
  if (activeTab === 'faq') {
    return (
      <div
        className={cn(
          heroVariants({ variant: uiOptions?.heroStyleVariant }),
          'flex-none',
        )}
      >
        <div className="flex flex-col">
          <span className="flex justify-between items-center">
            <h1 className="text-primary-foreground text-2xl">
              {getCurrentTitle()}
            </h1>
            <CloseButton />
          </span>
          {title && (
            <div className="mt-4">
              <h3 className="text-primary-foreground/80 text-xs font-normal mb-1.5">
                Browse {title}
              </h3>
              <SearchArticlesInput />
            </div>
          )}
        </div>
      </div>
    );
  }
  if (activeTab === 'web-call') {
    return (
      <div className="pb-5.5 px-5 pt-4.5 bg-(--color-hero) flex-none relative">
        <span className="flex justify-between items-center mb-1">
          <button
            className="text-primary-foreground cursor-pointer"
            onClick={() => switchToTab('default')}
          >
            <IconArrowLeft />
          </button>
          <CloseButton />
        </span>
        <h1 className="text-primary-foreground text-2xl">
          {getCurrentTitle()}
        </h1>
      </div>
    );
  }

  return (
    <div className="pb-[22px] px-5 pt-[18px] bg-(--color-hero) flex-none relative flex justify-between">
      <div className="flex flex-col">
        <h2 className="text-primary-foreground/60 text-xs font-light">
          {getCurrentEyebrow()}
        </h2>
        <h1 className="text-primary-foreground text-2xl">
          {getCurrentTitle()}
        </h1>
      </div>
      <CloseButton />
    </div>
  );
};
