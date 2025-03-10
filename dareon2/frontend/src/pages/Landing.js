import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    {
      icon: 'fas fa-folder-tree',
      title: 'Smart File Management',
      description: 'Automatically sort and organize files by type, date, size, and name with intelligent categorization.'
    },
    {
      icon: 'fas fa-envelope',
      title: 'Email Integration',
      description: 'Seamlessly sync with Outlook and Gmail for unified email and attachment management.'
    },
    {
      icon: 'fas fa-calendar-alt',
      title: 'Calendar Sync',
      description: 'Cross-platform calendar integration with TimeTree, Outlook, and more.'
    },
    {
      icon: 'fas fa-robot',
      title: 'AI Assistant',
      description: 'Natural language processing for intuitive command execution and task automation.'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Dareon2.0</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your intelligent workspace assistant that seamlessly manages files, emails, and calendars with advanced AI capabilities.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/login" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features for Modern Workspaces
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
            >
              <i className={`${feature.icon} text-4xl text-blue-600 mb-4`}></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trial Section */}
      <section className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Your 14-Day Free Trial
          </h2>
          <p className="text-xl mb-8">
            Experience the full power of Dareon2.0 with our no-commitment trial period.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="bg-white text-gray-900 p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
              <ul className="text-left mb-4">
                <li className="flex items-center mb-2">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Basic file management
                </li>
                <li className="flex items-center mb-2">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Email integration
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  Calendar sync
                </li>
              </ul>
              <Link 
                to="/register" 
                className="block w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-blue-600 mb-2">10K+</h3>
            <p className="text-gray-600">Active Users</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-600 mb-2">5M+</h3>
            <p className="text-gray-600">Files Managed</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-600 mb-2">99.9%</h3>
            <p className="text-gray-600">Uptime</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-600 mb-2">24/7</h3>
            <p className="text-gray-600">Support</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
