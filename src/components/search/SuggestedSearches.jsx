import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SuggestedSearches({ onSearch }) {
  const { t } = useTranslation();
  const suggestions = t("search.suggested.items", { returnObjects: true });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center mt-16"
    >
      <div className="inline-flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-black dark:text-white">{t("search.suggested.heading")}</h3>
      </div>
      <motion.div
        variants={containerVariants}
        className="flex flex-wrap justify-center gap-3"
      >
        {suggestions.map((text) => (
          <motion.div key={text} variants={itemVariants}>
            <Button
              variant="outline"
              className="apple-blur rounded-lg text-sm font-normal border-gray-200 dark:border-gray-700"
              onClick={() => onSearch(text)}
            >
              {text}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}