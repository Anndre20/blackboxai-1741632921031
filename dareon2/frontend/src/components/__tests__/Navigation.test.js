import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../Navigation';

// Mock useLocation hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/'
  })
}));

const renderNavigation = () => {
  return render(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  );
};

describe('Navigation Component', () => {
  beforeEach(() => {
    // Reset window size to desktop
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
  });

  it('renders the logo and brand name', () => {
    renderNavigation();
    
    expect(screen.getByText('Dareon2.0')).toBeInTheDocument();
    expect(screen.getByTestId('brand-logo')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderNavigation();
    
    const links = ['Home', 'Features', 'Pricing', 'About'];
    links.forEach(link => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it('renders auth buttons', () => {
    renderNavigation();
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
  });

  it('highlights active link', () => {
    renderNavigation();
    
    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveClass('text-blue-600');
  });

  describe('Mobile Menu', () => {
    beforeEach(() => {
      // Set window size to mobile
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
    });

    it('shows mobile menu button', () => {
      renderNavigation();
      
      expect(screen.getByRole('button', { name: /open main menu/i })).toBeInTheDocument();
    });

    it('toggles mobile menu on button click', async () => {
      renderNavigation();
      
      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      
      // Menu should be hidden initially
      expect(screen.queryByRole('navigation')).not.toBeVisible();
      
      // Click to open menu
      fireEvent.click(menuButton);
      
      // Menu should be visible
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeVisible();
      });
      
      // Click to close menu
      fireEvent.click(menuButton);
      
      // Menu should be hidden again
      await waitFor(() => {
        expect(screen.queryByRole('navigation')).not.toBeVisible();
      });
    });

    it('closes mobile menu when a link is clicked', async () => {
      renderNavigation();
      
      // Open menu
      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      fireEvent.click(menuButton);
      
      // Click a link
      const featuresLink = screen.getByText('Features');
      fireEvent.click(featuresLink);
      
      // Menu should close
      await waitFor(() => {
        expect(screen.queryByRole('navigation')).not.toBeVisible();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('shows desktop navigation on large screens', () => {
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));
      
      renderNavigation();
      
      expect(screen.getByTestId('desktop-nav')).toBeVisible();
      expect(screen.queryByTestId('mobile-nav')).not.toBeVisible();
    });

    it('shows mobile navigation on small screens', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      renderNavigation();
      
      expect(screen.queryByTestId('desktop-nav')).not.toBeVisible();
      expect(screen.getByTestId('mobile-nav')).toBeVisible();
    });
  });

  describe('Navigation Links', () => {
    it('navigates to correct routes when clicked', () => {
      renderNavigation();
      
      const links = [
        { text: 'Features', href: '/#features' },
        { text: 'Pricing', href: '/#pricing' },
        { text: 'About', href: '/#about' }
      ];
      
      links.forEach(({ text, href }) => {
        const link = screen.getByText(text);
        expect(link).toHaveAttribute('href', href);
      });
    });

    it('handles auth button clicks', () => {
      renderNavigation();
      
      const loginButton = screen.getByText('Login');
      const trialButton = screen.getByText('Start Free Trial');
      
      expect(loginButton).toHaveAttribute('href', '/login');
      expect(trialButton).toHaveAttribute('href', '/register');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderNavigation();
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('has correct tab order', () => {
      renderNavigation();
      
      const focusableElements = screen.getAllByRole('link');
      focusableElements.forEach((element, index) => {
        if (index > 0) {
          expect(element.tabIndex).toBe(0);
        }
      });
    });

    it('handles keyboard navigation', () => {
      renderNavigation();
      
      const menuButton = screen.getByRole('button', { name: /open main menu/i });
      
      // Focus menu button
      menuButton.focus();
      expect(document.activeElement).toBe(menuButton);
      
      // Press Enter to open menu
      fireEvent.keyDown(menuButton, { key: 'Enter', code: 'Enter' });
      
      // Menu should be visible
      expect(screen.getByRole('navigation')).toBeVisible();
    });
  });

  describe('Visual Feedback', () => {
    it('shows hover states on links', () => {
      renderNavigation();
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        fireEvent.mouseEnter(link);
        expect(link).toHaveClass('hover:text-blue-600');
        
        fireEvent.mouseLeave(link);
        expect(link).not.toHaveClass('text-blue-600');
      });
    });

    it('shows active states on buttons', () => {
      renderNavigation();
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        fireEvent.mouseDown(button);
        expect(button).toHaveClass('active:bg-gray-100');
        
        fireEvent.mouseUp(button);
        expect(button).not.toHaveClass('active:bg-gray-100');
      });
    });
  });
});
