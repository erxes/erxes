import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible } from 'erxes-ui';
import { TagsManager } from './tagsManager';
import { useParams } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProductDetail';

export function ProductProperties() {
  return (
    <div className="mx-auto w-full bg-white">
      <HotelSection />
      <TagsSection />
    </div>
  );
}

function HotelSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible defaultOpen={false} open={isOpen} onOpenChange={setIsOpen}>
      <Collapsible.Trigger className="flex items-center gap-2 w-full py-3 px-4 border-b border-gray-200">
        <motion.svg
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-4 w-4 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 6L15 12L9 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
        <span className="text-gray-600 font-medium">Hotels</span>
      </Collapsible.Trigger>
      <AnimatePresence initial={false}>
        {isOpen && (
          <Collapsible.Content forceMount asChild>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200">
                <p>Hotel details go here...</p>
              </div>
            </motion.div>
          </Collapsible.Content>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}

function TagsSection() {
  const [isOpen, setIsOpen] = useState(true);
  const params = useParams();
  const productId = params?.id as string;
  const { productDetail, refetch } = useProductDetail({ _id: productId });

  return (
    <Collapsible defaultOpen={true} open={isOpen} onOpenChange={setIsOpen}>
      <Collapsible.Trigger className="flex items-center gap-2 w-full py-3 px-4 border-b border-gray-200">
        <motion.svg
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-4 w-4 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 6L15 12L9 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
        <span className="text-gray-600 font-medium">Tags</span>
      </Collapsible.Trigger>
      <AnimatePresence initial={false}>
        {isOpen && (
          <Collapsible.Content forceMount asChild>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200">
                <TagsManager
                  productId={productDetail?._id}
                  initialTags={productDetail?.tagsId || []}
                  uom={productDetail?.uom || ''}
                  onTagsUpdated={() => refetch()}
                />
              </div>
            </motion.div>
          </Collapsible.Content>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}
