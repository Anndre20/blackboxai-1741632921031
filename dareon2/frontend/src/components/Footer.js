import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerSections = {
    product: {
      title: 'Product',
      links: [
        { name: 'Features', path: '/#features' },
        { name: 'Pricing', path: '/#pricing' },
        { name: 'Documentation', path: '/docs' },
        { name: 'API', path: '/api' }
      ]
    },
    company: {
      title: 'Company',
      links: [
        { name: 'About', path: '/about' },
        { name: 'Blog', path: '/blog' },
        { name: 'Careers', path: '/careers' },
        { name: 'Contact', path: '/contact' }
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy', path: '/privacy' },
        { name: 'Terms', path: '/terms' },
        { name: 'Security', path: '/security' },
        { name: 'Compliance', path: '/compliance' }
      ]
    },
    support: {
      title: 'Support',
      links: [
        { name: 'Help Center', path: '/help' },
        { name: 'Status', path: '/status' },
        { name: 'Community', path: '/community' },
        { name: 'Support Plans', path: '/support-plans' }
      ]
    }
  };

  const socialLinks = [
    { icon: 'fab fa-twitter', url: 'https://twitter.com' },
    { icon: 'fab fa-linkedin', url: 'https://linkedin.com' },
    { icon: 'fab fa-github', url: 'https://github.com' },
    { icon: 'fab fa-discord', url: 'https://discord.com' }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-base text-gray-600 hover:text-blue-600 transition duration-150"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Logo and Copyright */}
            <div className="flex items-center mb-4 md:mb-0">
              <i className="fas fa-robot text-blue-600 text-2xl mr-2"></i>
              <span className="text-xl font-bold text-gray-900">Dareon2.0</span>
              <span className="ml-4 text-gray-600">
                © {new Date().getFullYear()} All rights reserved.
              </span>
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition duration-150"
                >
                  <i className={`${social.icon} text-xl`}></i>
                  <span className="sr-only">{social.icon.split('-')[2]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-4 text-center md:text-left">
            <p className="text-sm text-gray-600">
              Dareon2.0 is a product of innovative AI technology, designed to transform your digital workspace management.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
