import { useRef, useState } from 'react';
import type {
  WelcomeVideoPlayerOptions,
  WelcomeVideoPlayerState,
  TVideoTabItem,
} from 'ui-modules/modules/notifications/types/welcome';
import { getYoutubeEmbedSrc } from 'ui-modules/modules/notifications/utils/welcomeVideo';

export const useWelcomeVideoPlayer = ({
  src,
  tabItems,
}: WelcomeVideoPlayerOptions): WelcomeVideoPlayerState => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeEmbedSrc = getYoutubeEmbedSrc(src);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleTabClick = (item: TVideoTabItem) => {
    if (item.time !== undefined && videoRef.current) {
      videoRef.current.currentTime = item.time;
      videoRef.current.play();
    }
  };

  const getActiveTab = () => {
    if (!tabItems) return null;
    const sortedTabs = [...tabItems]
      .filter((tab) => tab.time !== undefined)
      .sort((a, b) => (a.time || 0) - (b.time || 0));

    for (let i = 0; i < sortedTabs.length; i++) {
      const currentTab = sortedTabs[i];
      const nextTab = sortedTabs[i + 1];

      if (currentTab.time === undefined) continue;

      if (nextTab?.time !== undefined) {
        if (currentTime >= currentTab.time && currentTime < nextTab.time) {
          return currentTab.label;
        }
      } else if (currentTime >= currentTab.time) {
        return currentTab.label;
      }
    }

    return null;
  };

  const activeTabLabel = getActiveTab();
  const handleLoaded = () => setIsLoaded(true);

  return {
    isLoaded,
    videoRef,
    youtubeEmbedSrc,
    activeTabLabel,
    handleTimeUpdate,
    handleTabClick,
    handleLoaded,
  };
};
