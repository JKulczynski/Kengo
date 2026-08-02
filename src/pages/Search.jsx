
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Project } from "@/api/entities";
import { Document } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { motion, AnimatePresence } from "framer-motion";

import SearchBar from "../components/search/SearchBar";
import SearchResults from "../components/search/SearchResults";
import SuggestedSearches from "../components/search/SuggestedSearches";
import SearchLoadingSkeleton from "../components/search/SearchLoadingSkeleton";

export default function SearchPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pre-load all data to be searched
    const loadData = async () => {
      try {
        const [projectsData, documentsData] = await Promise.all([
          Project.list(),
          Document.list(),
        ]);
        setProjects(projectsData);
        setDocuments(documentsData);
      } catch (err) {
        console.error("Error loading data for search:", err);
        setError(t("search.errorLoadData"));
      }
    };
    loadData();
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
        // For simplicity, we stringify the core fields of our data.
        // In a real-world scenario with large datasets, we might use a more advanced search backend.
        const projectsContext = projects.map(({ id, name, description, type, status }) => ({ id, name, description, type, status }));
        const documentsContext = documents.map(({ id, title, type, category, vendor, amount, notes }) => ({ id, title, type, category, vendor, amount, notes }));

        const prompt = `
            You are an AI assistant for a home renovation app. Search through the provided JSON data of projects and documents to answer the user's query.

            User Query: "${searchQuery}"

            Available Projects:
            ${JSON.stringify(projectsContext)}

            Available Documents:
            ${JSON.stringify(documentsContext)}

            Based on the user query, return a JSON object containing arrays of the IDs of the matching projects and documents.
            The JSON object must have two keys: "project_ids" and "document_ids".
            If no matches are found, return empty arrays.
        `;
      
        const aiResponse = await InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    project_ids: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of matching project IDs",
                    },
                    document_ids: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of matching document IDs",
                    },
                },
                required: ["project_ids", "document_ids"],
            },
        });
        
        const foundProjects = projects.filter(p => aiResponse.project_ids.includes(p.id));
        const foundDocuments = documents.filter(d => aiResponse.document_ids.includes(d.id));

        setResults({ projects: foundProjects, documents: foundDocuments });

    } catch (err) {
        console.error("AI Search Error:", err);
        setError(t("search.errorSearch"));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-black tracking-tight">{t("search.header.title")}</h1>
          <p className="text-lg text-gray-500 mt-2">
            {t("search.header.subtitle")}
          </p>
        </header>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        
        {error && <div className="text-center text-red-500 mt-4">{error}</div>}

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <SearchLoadingSkeleton key="loading" />
            ) : results ? (
              <SearchResults key="results" results={results} />
            ) : (
              <SuggestedSearches key="suggestions" onSearch={handleSearch} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
