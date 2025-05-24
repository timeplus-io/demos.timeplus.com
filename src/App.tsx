import React, { useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import DemoGrid from "./components/demos/DemoGrid";
import DemoDetail from "./components/demos/DemoDetail";
import { demos } from "./data/demos";
import { Button } from "@/components/ui/button";

const DemoDetailRouteComponent: React.FC<{
  onTagClick: (tag: string) => void;
}> = ({ onTagClick }) => {
  const { demoId } = useParams<{ demoId: string }>(); // Changed param name
  const navigate = useNavigate();
  const selectedDemo = demoId ? demos.find((demo) => demo.id === demoId) : null;

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous view in history
  };

  return selectedDemo ? (
    <DemoDetail
      demo={selectedDemo}
      onBack={handleBackClick}
      onTagClick={onTagClick}
    />
  ) : (
    <div className="text-white p-8">Demo not found for ID: {demoId}</div>
  );
};

interface GridDisplayProps {
  searchQuery: string;
  selectedCategory?: string;
  onDemoClick: (id: string) => void;
  onTagClick: (tag: string) => void;
  availableCategories: string[];
  onCategoryChange: (category?: string) => void;
  onSearchChange: (query: string) => void;
}

const TagFilteredGridRouteComponent: React.FC<
  GridDisplayProps & { onClearTagFilter: () => void }
> = (props) => {
  const { tagName } = useParams<{ tagName: string }>(); // Changed param name
  const decodedTag = tagName ? decodeURIComponent(tagName) : undefined;

  return (
    <>
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Timeplus Product Demos
        </h1>
        <p className="text-timeplus-gray-100 text-lg md:text-xl max-w-3xl mx-auto">
          Explore our interactive demos showcasing real-time data processing,
          analytics, and streaming solutions.
        </p>
      </div>
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search demos..."
            className="w-full px-4 py-3 rounded-lg bg-timeplus-gray-300 border border-timeplus-gray-200 text-white
                           placeholder-timeplus-gray-100 focus:outline-none focus:ring-2 focus:ring-timeplus-pink"
            value={props.searchQuery}
            onChange={(e) => props.onSearchChange(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3">
          <select
            className="w-full px-4 py-3 rounded-lg bg-timeplus-gray-300 border border-timeplus-gray-200 text-white
                           focus:outline-none focus:ring-2 focus:ring-timeplus-pink"
            value={props.selectedCategory || ""}
            onChange={(e) =>
              props.onCategoryChange(e.target.value || undefined)
            }
          >
            <option value="">All Categories</option>
            {props.availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      {decodedTag && (
        <div className="mb-4 flex items-center">
          Filtering by tag:{" "}
          <span
            className="font-bold p-1 bg-timeplus-pink text-white rounded
mx-2"
          >
            {decodedTag}
          </span>
          <Button
            onClick={props.onClearTagFilter}
            variant="link"
            className="text-timeplus-pink p-0 h-auto"
          >
            Clear filter
          </Button>
        </div>
      )}
      <DemoGrid
        demos={demos}
        onDemoClick={props.onDemoClick}
        onTagClick={props.onTagClick}
        selectedCategory={props.selectedCategory}
        searchQuery={props.searchQuery}
        selectedTag={decodedTag}
      />
    </>
  );
};

// Main application logic and layout component
const MainAppLogic: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );

  const categories = Array.from(new Set(demos.map((demo) => demo.category)));

  const handleDemoClick = (id: string) => {
    navigate(`/id/${id}`);
    window.scrollTo(0, 0);
  };

  const handleTagClick = (tag: string) => {
    navigate(`/tag/${encodeURIComponent(tag)}`);
  };

  const handleClearTagFilter = () => {
    navigate("/"); // Navigate to the root path to clear tag filter
  };

  const gridDisplayProps: GridDisplayProps = {
    searchQuery,
    selectedCategory,
    onDemoClick: handleDemoClick,
    onTagClick: handleTagClick,
    availableCategories: categories,
    onCategoryChange: setSelectedCategory,
    onSearchChange: setSearchQuery,
  };

  return (
    <div className="flex flex-col min-h-screen bg-timeplus-gray-400 text-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={
              // Element for the root path (unfiltered grid)
              <>
                <div className="mb-12 text-center">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Timeplus Product Demos
                  </h1>
                  <p className="text-timeplus-gray-100 text-lg md:text-xl max-w-3xl mx-auto">
                    Explore our interactive demos showcasing real-time data
                    processing, analytics, and streaming solutions.
                  </p>
                </div>
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-2/3">
                    <input
                      type="text"
                      placeholder="Search demos..."
                      className="w-full px-4 py-3 rounded-lg bg-timeplus-gray-300 border border-timeplus-gray-200
text-white
                           placeholder-timeplus-gray-100 focus:outline-none focus:ring-2 focus:ring-timeplus-pink"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <select
                      className="w-full px-4 py-3 rounded-lg bg-timeplus-gray-300 border border-timeplus-gray-200
text-white
                           focus:outline-none focus:ring-2 focus:ring-timeplus-pink"
                      value={selectedCategory || ""}
                      onChange={(e) =>
                        setSelectedCategory(e.target.value || undefined)
                      }
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DemoGrid
                  demos={demos}
                  onDemoClick={handleDemoClick}
                  onTagClick={handleTagClick}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  selectedTag={undefined}
                />
              </>
            }
          />
          <Route
            path="/tag/:tagName"
            element={
              <TagFilteredGridRouteComponent
                {...gridDisplayProps}
                onClearTagFilter={handleClearTagFilter}
              />
            }
          />
          <Route
            path="/id/:demoId"
            element={<DemoDetailRouteComponent onTagClick={handleTagClick} />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <MainAppLogic />
    </HashRouter>
  );
};

export default App;
