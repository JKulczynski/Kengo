import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import SearchResultItem from './SearchResultItem';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function SearchResults({ results }) {
  const { t } = useTranslation();
  const { projects, documents } = results;
  const totalResults = projects.length + documents.length;

  if (totalResults === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-16"
      >
        <h3 className="text-xl font-medium text-black dark:text-white">{t("search.results.noResultsTitle")}</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{t("search.results.noResultsDesc")}</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {totalResults === 1 ? t("search.results.countOne", { count: totalResults }) : t("search.results.countMany", { count: totalResults })}
      </p>

      <AnimatePresence>
        {projects.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4 tracking-tight">{t("search.results.projects")}</h2>
            <div className="space-y-4">
              {projects.map(project => <SearchResultItem key={project.id} item={project} type="project" />)}
            </div>
          </section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {documents.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4 tracking-tight">{t("search.results.documents")}</h2>
            <div className="space-y-4">
              {documents.map(doc => <SearchResultItem key={doc.id} item={doc} type="document" />)}
            </div>
          </section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}