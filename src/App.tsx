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

const DemoDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate("/");
  };
  const selectedDemoFromId = id ? demos.find((demo) => demo.id === id) : null;
  return selectedDemoFromId ? (
    <DemoDetail demo={selectedDemoFromId} onBack={handleBackClick} />
  ) : (
    <div className="text-white p-8">Demo not found</div>
  );
};
const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );
  const categories = Array.from(new Set(demos.map((demo) => demo.category)));

  const handleDemoClick = (id: string) => {
    window.location.href = `/#${id}`;
    window.scrollTo(0, 0);
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-timeplus-gray-400 text-white">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
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
                        className="w-full px-4 py-3 rounded-lg bg-timeplus-gray-300 border border-timeplus-gray-200 text-white
       placeholder-timeplus-gray-100 focus:outline-none focus:ring-2 focus:ring-timeplus-pink"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-1/3">
                      <select
                        className="w-full px-4 py-3 rounded-lg bg-timeplus-gray-300 border border-timeplus-gray-200 text-white
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
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                  />
                </>
              }
            />
            <Route path="/:id" element={<DemoDetailWrapper />} />
          </Routes>
        </main>
        <Routes>
          <Route path="/" element={<></>} />
          <Route path="/demo/:id" element={<DemoDetailWrapper />} />
        </Routes>

        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
