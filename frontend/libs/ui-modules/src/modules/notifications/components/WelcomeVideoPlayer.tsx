import { cn } from 'erxes-ui';
import { motion } from 'framer-motion';
import { useWelcomeVideoPlayer } from 'ui-modules/modules/notifications/hooks/useWelcomeVideoPlayer';
import type { WelcomeVideoPlayerProps } from 'ui-modules/modules/notifications/types/welcome';

export const WelcomeVideoPlayer = ({
  src,
  tabItems,
  poster,
}: WelcomeVideoPlayerProps) => {
  const {
    isLoaded,
    videoRef,
    youtubeEmbedSrc,
    activeTabLabel,
    handleTimeUpdate,
    handleTabClick,
    handleLoaded,
  } = useWelcomeVideoPlayer({ src, tabItems });

  return (
    <div className="space-y-4">
      {tabItems && (
        <div className="w-min mx-auto max-w-[calc(100vw-2rem)]">
          <div className="rounded-lg border overflow-x-auto border-foreground/10 bg-foreground/10 p-1 relative">
            <div className="flex gap-2 relative">
              {tabItems.map((item) => (
                <motion.div
                  key={item.label}
                  onClick={() => handleTabClick(item)}
                  className={cn(
                    'flex items-center justify-center gap-2 font-medium text-[13px] py-2 px-2 rounded-[4px] text-center transition-colors relative z-10',
                    activeTabLabel === item.label && 'text-primary',
                    item.time !== undefined &&
                      'cursor-pointer hover:text-primary',
                  )}
                  transition={{ duration: 0.15 }}
                >
                  <motion.div
                    animate={{
                      scale: activeTabLabel === item.label ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="truncate">{item.label}</span>
                  {activeTabLabel === item.label && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white shadow-sm rounded-[4px] z-[-1]"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 40,
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full border border-foreground/10 overflow-hidden bg-foreground/10 p-2 rounded-[20px]">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {youtubeEmbedSrc ? (
          <div className="relative w-full aspect-video rounded-xl border border-foreground/10 overflow-hidden bg-background">
            <iframe
              src={youtubeEmbedSrc}
              title="Welcome video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className={`absolute left-0 -top-[15%] w-full h-[130%] transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleLoaded}
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={src}
            controls
            poster={poster}
            className={`w-full h-full transition-opacity duration-300 bg-background rounded-xl border border-foreground/10 overflow-hidden ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadedData={handleLoaded}
            onTimeUpdate={handleTimeUpdate}
            preload="metadata"
          />
        )}
      </div>
    </div>
  );
};
