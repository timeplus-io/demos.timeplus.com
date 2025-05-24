import React from "react";
import ReactMarkdown from "react-markdown";
import mermaid from "mermaid";
import SyntaxHighlighter from "react-syntax-highlighter";
import { pojoaque } from "react-syntax-highlighter/dist/esm/styles/hljs"; // Choose a theme
import { Demo } from "../../data/demos";

interface DemoDetailProps {
  demo: Demo;
  onBack: () => void;
  onTagClick?: (tag: string) => void;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

const DemoDetail: React.FC<DemoDetailProps> = ({
  demo,
  onBack,
  onTagClick = () => {},
}) => {
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = React.useState<{
    desc: string;
    src: string;
  } | null>(null);

  React.useEffect(() => {
    mermaid.init(
      undefined,
      document.querySelectorAll('.mermaid:not([data-processed="true"])'),
    );
  }, [demo.dataFlowMarkdown]);

  const handleScreenshotClick = (screenshot: { desc: string; src: string }) => {
    setSelectedScreenshot(screenshot);
    setIsFullScreen(true);
  };
  return (
    <div className="bg-timeplus-gray-300 rounded-lg overflow-hidden">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={demo.coverImage}
          style={{
            position: "absolute",
            right: 0,
            width: "40%",
            height: "80%",
            objectFit: "contain",
          }}
          alt={`${demo.title} cover`}
          className="h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-timeplus-gray-400 to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 p-6 w-full">
          <button
            onClick={onBack}
            className="mb-4 px-3 py-1 rounded-md bg-timeplus-gray-200 text-white hover:bg-timeplus-gray-100
transition-colors flex items-center"
          >
            <span className="mr-1">←</span> Back to demos
          </button>
          <span
            className="px-3 py-1 text-xs font-medium rounded-full bg-timeplus-gradient text-white mb-2
inline-block"
          >
            {demo.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {demo.title}
          </h1>
          <p className="text-timeplus-gray-100 text-lg md:text-xl">
            {demo.subtitle}
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {demo.keywords.map((keyword, index) => (
            <span
              onClick={() => onTagClick(keyword)}
              key={index}
              className="px-2 py-1 text-xs rounded-md bg-timeplus-gray-200 text-timeplus-gray-100
hover:bg-timeplus-gray-100 hover:text-white cursor-pointer" // <-- Updated this line
            >
              {keyword}
            </span>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
          <div className="text-timeplus-gray-100 prose prose-invert max-w-none markdown-content">
            <ReactMarkdown>{demo.introduction}</ReactMarkdown>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Challenges</h2>
          <div className="text-timeplus-gray-100 prose prose-invert max-w-none markdown-content">
            <ReactMarkdown>{demo.challenges}</ReactMarkdown>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Solution</h2>
          <div className="text-timeplus-gray-100 prose prose-invert max-w-none markdown-content">
            <ReactMarkdown>{demo.solution}</ReactMarkdown>
          </div>
        </div>

        {demo.screenshots && demo.screenshots.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Screenshots</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {demo.screenshots.map((screenshot, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`screenshots/${demo.id}/${screenshot.src}`}
                    alt={screenshot.desc}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80
transition-opacity"
                    onClick={() => {
                      handleScreenshotClick(screenshot);
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-sm p-2
rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {screenshot.desc}
                  </div>
                </div>
              ))}
            </div>
            {isFullScreen && selectedScreenshot && (
              <div
                className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                onClick={() => setIsFullScreen(false)}
              >
                <img
                  src={`screenshots/${demo.id}/${selectedScreenshot.src.split("/").pop()}`}
                  alt={selectedScreenshot.desc}
                  className="max-w-[90%] max-h-[90%] object-contain"
                />
                <button
                  onClick={() => setIsFullScreen(false)}
                  className="absolute top-4 right-4 text-white bg-timeplus-gray-200 rounded-full w-8 h-8 flex
items-center justify-center"
                >
                  ✖️
                </button>
                <div className="absolute bottom-4 left-0 right-0 text-center text-white px-4">
                  {selectedScreenshot.desc}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Key Steps</h2>
          <ol className="list-decimal pl-5 space-y-2">
            {demo.steps.map((step, index) => (
              <li key={index} className="text-timeplus-gray-100">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Data Flow</h2>
          <div className="w-full max-h-196 overflow-hidden rounded-lg bg-timeplus-gray-200">
            {demo.dataFlowImage ? (
              <img
                src={demo.dataFlowImage}
                alt={`${demo.title} Data Flow`}
                className="w-full h-auto object-contain"
              />
            ) : demo.dataFlowMarkdown ? (
              <div
                className="mermaid p-4"
                style={{
                  backgroundColor: "#2D3748",
                  color: "white",
                  overflow: "auto",
                }}
              >
                {demo.dataFlowMarkdown}
              </div>
            ) : (
              <p className="text-timeplus-gray-100 p-4">
                No data flow visualization available.
              </p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">SQL Example</h2>
          <div className="bg-timeplus-gray-200 rounded-lg overflow-x-auto text-sm">
            <SyntaxHighlighter
              language="sql"
              style={pojoaque}
              showLineNumbers
              wrapLines={true}
              className="text-timeplus-gray-50"
            >
              {demo.sqlExample}
            </SyntaxHighlighter>
          </div>
        </div>

        {demo.youtubeVideoLink && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Demo Video</h2>
            <div
              className="relative"
              style={{ paddingBottom: "56.25%", height: 0, overflow: "hidden" }}
            >
              <iframe
                src={demo.youtubeVideoLink}
                title={`${demo.title} Demo Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              />
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Demo Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demo.demoLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-lg bg-timeplus-gray-200 hover:bg-timeplus-gray-100 transition-colors"
                style={{ backgroundColor: "#2D3748" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4A5568")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2D3748")
                }
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {link.title}
                </h3>
                {link.description && (
                  <p className="text-timeplus-gray-100 text-sm">
                    {link.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoDetail;
