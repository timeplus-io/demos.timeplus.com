import React from "react";
import { Demo } from "../../data/demos";

interface DemoCardProps {
  demo: Demo;
  onClick: (id: string) => void;
  onTagClick?: (tag: string) => void;
}

const DemoCard: React.FC<DemoCardProps> = ({
  demo,
  onClick,
  onTagClick = () => {},
}) => {
  return (
    <div
      className="group cursor-pointer rounded-lg overflow-hidden bg-timeplus-gray-300 border
border-timeplus-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col"
      onClick={() => onClick(demo.id)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={demo.coverImage}
          alt={`${demo.title} cover`}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center mb-2">
          {" "}
          <h3 className="text-xl font-bold text-white">{demo.title}</h3>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-timeplus-gradient text-white">
            {demo.category}
          </span>
        </div>
        <p className="text-timeplus-gray-100 mb-4 text-sm flex-grow">
          {demo.subtitle}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {demo.keywords.slice(0, 3).map((keyword, index) => (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(keyword);
              }}
              key={index}
              className="px-2 py-1 text-xs rounded-md bg-timeplus-gray-200 text-timeplus-gray-100
hover:bg-timeplus-gray-100 hover:text-white cursor-pointer"
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
