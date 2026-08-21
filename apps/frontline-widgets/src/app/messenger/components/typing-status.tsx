import { IconBrain } from '@tabler/icons-react';
import { Badge, Spinner } from 'erxes-ui';
import { motion } from 'motion/react';
import { Marker } from './bot-marker';
import React from 'react';
import { Message } from './message';

export const TypingStatus = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-end justify-start gap-2"
    >
      <Message>
        <Message.Row>
          <Message.Avatar show className="">
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <IconBrain size={20} aria-hidden="true" />
            </div>
          </Message.Avatar>

          <Message.Body align="start">
            <Message.Author>
              <div className="text-[11px] text-muted-foreground px-1 font-medium">
                Ai Agent{' '}
                <Badge
                  variant={'ghost'}
                  className="text-[10px] leading-none rounded-xl bg-primary/15 text-primary h-auto py-0.5"
                >
                  Auto
                </Badge>
              </div>
            </Message.Author>
            <Message.Content
              variant="bot"
              position={{ isSingleMessage: true }}
              className="font-medium shadow-2xs"
            >
              <Marker role="status">
                <Marker.Icon>
                  <Spinner size={'sm'} />
                </Marker.Icon>
                <Marker.Content className="shimmer">
                  <Typewriter text="Thinking..." loop />
                </Marker.Content>
              </Marker>
            </Message.Content>
          </Message.Body>
        </Message.Row>
      </Message>
    </motion.div>
  );
};

interface TypewriterStaggerProps {
  text: string;
  className?: string;
  delayPerChar?: number; // seconds
}

export function TypewriterStagger({
  text,
  className,
  delayPerChar = 0.3,
}: TypewriterStaggerProps) {
  const letters = React.useMemo(() => Array.from(text), [text]);

  return (
    <span className={className} aria-label={text}>
      {letters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          aria-hidden="true"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * delayPerChar,
            duration: 0.2,
            ease: 'easeOut',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number; // ms per character
  cursor?: boolean;
  loop?: boolean;
  loopDelay?: number; // ms to hold the full text before retyping
  onComplete?: () => void;
}

export function Typewriter({
  text,
  className,
  speed = 40,
  cursor = true,
  loop = false,
  loopDelay = 1200,
  onComplete,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [isDone, setIsDone] = React.useState(false);
  const onCompleteRef = React.useRef(onComplete);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  React.useEffect(() => {
    setDisplayedText('');
    setIsDone(false);

    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      i += 1;
      setDisplayedText(text.slice(0, i));

      if (i < text.length) {
        timeout = setTimeout(tick, speed);
        return;
      }

      setIsDone(true);
      onCompleteRef.current?.();

      if (loop) {
        timeout = setTimeout(() => {
          i = 0;
          setDisplayedText('');
          setIsDone(false);
          timeout = setTimeout(tick, speed);
        }, loopDelay);
      }
    };

    timeout = setTimeout(tick, speed);

    return () => clearTimeout(timeout);
  }, [text, speed, loop, loopDelay]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && (
        <motion.span
          aria-hidden="true"
          className="inline-block w-[1ch] -mb-0.5"
          animate={{ opacity: isDone ? [1, 1, 0, 0] : 1 }}
          transition={
            isDone
              ? {
                  repeat: Infinity,
                  duration: 0.8,
                  times: [0, 0.49, 0.5, 1],
                  ease: 'linear',
                }
              : { duration: 0 }
          }
        >
          |
        </motion.span>
      )}
    </span>
  );
}
