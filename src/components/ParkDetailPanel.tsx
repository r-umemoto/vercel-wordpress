'use client';

import type { Park } from "../app/api/parks/route";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import Spinner from "./Spinner";

type Props = {
  park: Park | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
};

export default function ParkDetailPanel({ park, isOpen, isLoading, onClose }: Props) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Spinner fullscreen={false} />
        </div>
      );
    }

    if (!park) {
      return <div className="p-6 text-center">公園が見つかりません。</div>;
    }

    const cleanContent = park.content ? DOMPurify.sanitize(park.content) : "";

    return (
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{park.name}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        {park.thumbnail && (
          <div className="relative w-full h-64 mb-4">
            <Image
              src={park.thumbnail.url}
              alt={park.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}
        {park.description && (
          <p className="text-lg text-gray-600 my-4">{park.description}</p>
        )}
        {park.map?.address && (
          <p className="text-md text-gray-500 my-4">{park.map.address}</p>
        )}

        
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
        className={`relative z-50 bg-white dark:bg-gray-800 shadow-xl rounded-lg w-11/12 max-w-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
