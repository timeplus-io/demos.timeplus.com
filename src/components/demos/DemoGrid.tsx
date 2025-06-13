import React from "react";
import DemoCard from "./DemoCard";
import { Demo } from "../../data/demos";

interface DemoGridProps {
  demos: Demo[];
  onDemoClick: (id: string) => void;
  selectedCategory?: string;
  searchQuery?: string;
  selectedTag?: string;
  onTagClick?: (tag: string) => void; // <-- Added onTagClick
}

const DemoGrid: React.FC<DemoGridProps> = ({
  demos,
  onDemoClick,
  selectedCategory,
  searchQuery,
  selectedTag,
  onTagClick,
}) => {
  // Sort demos by rank, handling undefined ranks
  const sortedDemos = [...demos].sort((a, b) => {
    const rankA = a.rank ?? Infinity;
    const rankB = b.rank ?? Infinity;
    return rankA - rankB;
  });
  // Filter demos based on category, search query and tags
  const filteredDemos = sortedDemos.filter((demo) => {
    const matchesCategory =
      !selectedCategory || demo.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      demo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demo.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demo.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesTag = !selectedTag || demo.keywords.includes(selectedTag);
    return matchesCategory && matchesSearch && matchesTag;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredDemos.length > 0 ? (
        filteredDemos.map((demo) => (
          <DemoCard
            key={demo.id}
            demo={demo}
            onClick={onDemoClick}
            onTagClick={onTagClick}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-timeplus-gray-100 text-lg">
            No demos found matching your criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default DemoGrid;
