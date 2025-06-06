import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-timeplus-gray-400 border-b border-timeplus-gray-300">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
        <a href="/" className="flex items-center mb-4 md:mb-0">
          <div className="mr-3">
            <div className="h-10 w-10 rounded-md flex items-center justify-center">
              <img
                src="timeplus_logo.svg"
                alt="Timeplus Logo"
                className="h-8 w-8"
              />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold">Timeplus Demos</h1>
        </a>{" "}
        <nav className="flex items-center space-x-6">
          <a
            href="https://timeplus.com"
            className="text-timeplus-gray-100 hover:text-white transition-colors"
          >
            Home
          </a>
          <a
            href="https://docs.timeplus.com"
            className="text-timeplus-gray-100 hover:text-white transition-colors"
          >
            Docs
          </a>
          <a
            href="https://timeplus.com/slack"
            className="text-timeplus-gray-100 hover:text-white transition-colors"
          >
            Join Slack
          </a>
          <a
            href="https://timeplus.com/contact"
            className="px-4 py-2 rounded-md bg-timeplus-gradient text-white hover:opacity-90 transition-opacity"
          >
            Contact Us
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
