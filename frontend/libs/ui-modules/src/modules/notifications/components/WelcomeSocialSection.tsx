import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { WelcomeSocialSectionProps } from 'ui-modules/modules/notifications/types/welcome';

export const WelcomeSocialSection = ({
  items,
  external = false,
}: WelcomeSocialSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.0 }}
  >
    <h3 className="text-base font-medium text-muted-foreground text-center mb-4">
      Contact Us:
    </h3>
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((item) => {
        return external ? (
          <a
            href={item.url}
            key={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="bg-muted text-muted-foreground  rounded-sm p-[6px]">
              {item.icon}
            </div>
          </a>
        ) : (
          <Link to={item.url} key={item.url}>
            <div className="bg-muted text-muted-foreground  rounded-sm p-[6px]">
              {item.icon}
            </div>
          </Link>
        );
      })}
    </div>
  </motion.div>
);
