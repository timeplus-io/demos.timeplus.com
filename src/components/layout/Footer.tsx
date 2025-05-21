import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-timeplus-gray-400 border-t border-timeplus-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-timeplus-gray-100 text-sm">
              © {new Date().getFullYear()} Timeplus. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="https://twitter.com/timeplusdata" className="text-timeplus-gray-100 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="https://github.com/timeplus-io" className="text-timeplus-gray-100 hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://linkedin.com/company/timeplusinc" className="text-timeplus-gray-100 hover:text-white transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
