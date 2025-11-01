import { Avatar, Button, cn } from 'erxes-ui';

export const TypingStatus = () => {
  return (
    <Button
      variant="ghost"
      className="flex group/customer-message items-center size-auto gap-2 flex-row p-0 hover:bg-transparent"
    >
      <Avatar className='size-10'>
        <Avatar.Fallback className="animate-pulse bg-accent">B</Avatar.Fallback>
      </Avatar>
      <div className="inline-flex text-xs text-muted-foreground py-2 px-3">
        {'Typing...'.split('').map((letter, idx) => (
          <p
            key={idx}
            className={cn(
              {
                'delay-0': idx === 0 || idx === 7,
                'delay-75': idx === 1 || idx === 8,
                'delay-100': idx === 2 || idx === 9,
                'delay-150': idx === 3,
                'delay-200': idx === 4,
                'delay-300': idx === 5,
                'delay-400': idx === 6,
              },
              letter === '.' ? `animate-bounce` : 'animate-pulse',
            )}
          >
            {letter}
          </p>
        ))}
      </div>
    </Button>
  );
};
