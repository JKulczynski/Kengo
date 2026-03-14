import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

export default function SearchBar({ onSearch, isLoading }) {
  const [inputValue, setInputValue] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 sticky top-4 z-10 apple-blur p-2 rounded-xl apple-shadow-lg">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <Input
          type="search"
          placeholder="np. faktury za kuchnię powyżej 500 zł"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pl-10 pr-4 py-3 h-12 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg h-10 px-6 text-sm font-medium"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Szukaj'}
      </Button>
    </form>
  );
}