import React from 'react';
import { Demo } from '../../data/demos';

interface DemoCardProps {
  demo: Demo;
  onClick: (id: string) => void;
}

const DemoCard: React.FC<DemoCardProps> = ({ demo, onClick }) => {
  return (
    <div 
      className="group cursor-pointer rounded-lg overflow-hidden bg-timeplus-gray-300 border border-timeplus-gray-200 hover:shadow-lg transition-all duration-300"
      onClick={() => onClick(demo.id)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={demo.coverImage} 
          alt={`${demo.title} cover`} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-timeplus-gradient text-white">
            {demo.category}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2">{demo.title}</h3>
        <p className="text-timeplus-gray-100 mb-4">{demo.subtitle}</p>
        
        <div className="flex flex-wrap gap-2">
          {demo.keywords.slice(0, 3).map((keyword, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs rounded-md bg-timeplus-gray-200 text-timeplus-gray-100"
            >
              {keyword}
            </span>
          ))}
          {demo.keywords.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-md bg-timeplus-gray-200 text-timeplus-gray-100">
              +{demo.keywords.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoCard;
