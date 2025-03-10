import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

const renderFooter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
};

describe('Footer Component', () => {
  describe('Rendering', () => {
    it('renders all footer sections', () => {
      renderFooter();

      const sections = ['Product', 'Company', 'Legal', 'Support'];
      sections.forEach(section => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });

    it('renders product links', () => {
      renderFooter();

      const productLinks = ['Features', 'Pricing', 'Documentation', 'API'];
      productLinks.forEach(link => {
        expect(screen.getByText(link)).toBeInTheDocument();
      });
    });

    it('renders company links', () => {
      renderFooter();

      const companyLinks = ['About', 'Blog', 'Careers', 'Contact'];
      companyLinks.forEach(link => {
        expect(screen.getByText(link)).toBeInTheDocument();
      });
    });

    it('renders legal links', () => {
      renderFooter();

      const legalLinks = ['Privacy', 'Terms', 'Security', 'Compliance'];
      legalLinks.forEach(link => {
        expect(screen.getByText(link)).toBeInTheDocument();
      });
    });

    it('renders support links', () => {
      renderFooter();

      const supportLinks = ['Help Center', 'Status', 'Community', 'Support Plans'];
      supportLinks.forEach(link => {
        expect(screen.getByText(link)).toBeInTheDocument();
      });
    });

    it('renders social media links', () => {
      renderFooter();

      const socialLinks = ['twitter', 'linkedin', 'github', 'discord'];
      socialLinks.forEach(platform => {
        const link = screen.getByRole('link', { name: new RegExp(platform, 'i') });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('renders logo and copyright', () => {
      renderFooter();

      expect(screen.getByText('Dareon2.0')).toBeInTheDocument();
      expect(screen.getByText(/© \d{4} All rights reserved/)).toBeInTheDocument();
    });

    it('renders company description', () => {
      renderFooter();

      expect(screen.getByText(/Dareon2.0 is a product of innovative AI technology/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('has working links with correct hrefs', () => {
      renderFooter();

      const links = [
        { text: 'Features', href: '/#features' },
        { text: 'Pricing', href: '/#pricing' },
        { text: 'About', href: '/about' },
        { text: 'Contact', href: '/contact' }
      ];

      links.forEach(({ text, href }) => {
        const link = screen.getByText(text);
        expect(link).toHaveAttribute('href', href);
      });
    });

    it('has working social media links', () => {
      renderFooter();

      const socialLinks = [
        { platform: 'twitter', url: 'https://twitter.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
        { platform: 'github', url: 'https://github.com' },
        { platform: 'discord', url: 'https://discord.com' }
      ];

      socialLinks.forEach(({ platform, url }) => {
        const link = screen.getByRole('link', { name: new RegExp(platform, 'i') });
        expect(link).toHaveAttribute('href', url);
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      // Reset window size before each test
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));
    });

    it('renders in grid layout on desktop', () => {
      renderFooter();
      const footerGrid = screen.getByTestId('footer-grid');
      expect(footerGrid).toHaveClass('grid-cols-4');
    });

    it('renders in column layout on mobile', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      renderFooter();
      const footerGrid = screen.getByTestId('footer-grid');
      expect(footerGrid).toHaveClass('grid-cols-2');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderFooter();

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      
      const socialLinks = screen.getAllByRole('link', { name: /social/i });
      socialLinks.forEach(link => {
        expect(link).toHaveAttribute('aria-label');
      });
    });

    it('has proper focus indicators', () => {
      renderFooter();

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        link.focus();
        expect(link).toHaveClass('focus:outline-none', 'focus:ring-2');
      });
    });

    it('has proper heading hierarchy', () => {
      renderFooter();

      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        expect(heading).toHaveAttribute('class', expect.stringContaining('text-sm font-semibold'));
      });
    });
  });

  describe('Interactive Elements', () => {
    it('shows hover states on links', () => {
      renderFooter();

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        fireEvent.mouseEnter(link);
        expect(link).toHaveClass('hover:text-blue-600');
        
        fireEvent.mouseLeave(link);
        expect(link).not.toHaveClass('text-blue-600');
      });
    });

    it('shows hover states on social icons', () => {
      renderFooter();

      const socialLinks = screen.getAllByRole('link', { name: /social/i });
      socialLinks.forEach(link => {
        fireEvent.mouseEnter(link);
        expect(link).toHaveClass('hover:text-blue-600');
        
        fireEvent.mouseLeave(link);
        expect(link).not.toHaveClass('text-blue-600');
      });
    });
  });

  describe('Dynamic Content', () => {
    it('displays current year in copyright notice', () => {
      renderFooter();
      
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    });
  });
});
