'use client';

import { useState } from "react";

export type SearchCriteria = {
  title: string;
  description: string;
  content: string;
  publishedAt: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchCriteria) => void;
};

export default function SideMenu({ isOpen, onClose, onSearch }: Props) {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    title: "",
    description: "",
    content: "",
    publishedAt: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(criteria);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Menu */}
      <div
        className={`relative z-50 h-full w-80 max-w-[calc(100%-3rem)] bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out transform-gpu ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">詳細検索</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="title" className="block text-sm font-medium">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={criteria.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={criteria.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium">Content</label>
              <input
                type="text"
                id="content"
                name="content"
                value={criteria.content}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              />
            </div>
            <div>
              <label htmlFor="publishedAt" className="block text-sm font-medium">PublishedAt</label>
              <input
                type="text"
                id="publishedAt"
                name="publishedAt"
                value={criteria.publishedAt}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                検索
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
