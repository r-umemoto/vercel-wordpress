'use client';

import type { Property } from "../app/api/blogs/route";
import DOMPurify from "isomorphic-dompurify";
import Spinner from "./Spinner";

type Props = {
  property: Property | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
};

export default function PropertyDetailPanel({ property, isOpen, isLoading, onClose }: Props) {
  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }

    if (!property) {
      return <div className="p-6 text-center">物件が見つかりません。</div>;
    }

    const cleanContent = property.content ? DOMPurify.sanitize(property.content) : "";

    return (
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{property.title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <p className="text-gray-500 mb-8">公開日: {new Date(property.publishedAt).toLocaleDateString()}</p>
        
        {cleanContent && (
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanContent }} 
          />
        )}
      </div>
    );
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

      {/* Panel */}
      <div
        className={`relative z-50 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out transform-gpu ml-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
