import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock file controller
jest.mock('../../controllers/file.controller', () => ({
  getFiles: jest.fn().mockResolvedValue({
    data: [
      { name: 'Q2 Report.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago' },
      { name: 'Meeting Notes.docx', type: 'Document', size: '542 KB', modified: '5 hours ago' }
    ]
  }),
  sortFiles: jest.fn().mockResolvedValue({
    data: [
      { name: 'Meeting Notes.docx', type: 'Document', size: '542 KB', modified: '5 hours ago' },
      { name: 'Q2 Report.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago' }
    ]
  }),
  searchFiles: jest.fn().mockResolvedValue({
    data: [
      { name: 'Q2 Report.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago' }
    ]
  })
}));

const mockStats = {
  filesManaged: 2543,
  storageUsed: '45.2 GB',
  activeIntegrations: 4,
  tasksCompleted: 156
};

const mockIntegrationStatus = [
  { name: 'Microsoft Outlook', status: 'Connected', icon: 'fab fa-microsoft' },
  { name: 'Gmail', status: 'Connected', icon: 'fab fa-google' }
];

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dashboard header', () => {
      renderDashboard();
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /new task/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    it('renders statistics cards', () => {
      renderDashboard();
      
      expect(screen.getByText('Files Managed')).toBeInTheDocument();
      expect(screen.getByText('Storage Used')).toBeInTheDocument();
      expect(screen.getByText('Active Integrations')).toBeInTheDocument();
      expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
      
      expect(screen.getByText(mockStats.filesManaged.toString())).toBeInTheDocument();
      expect(screen.getByText(mockStats.storageUsed)).toBeInTheDocument();
    });

    it('renders recent files section', async () => {
      renderDashboard();
      
      expect(screen.getByText('Recent Files')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Q2 Report.pdf')).toBeInTheDocument();
        expect(screen.getByText('Meeting Notes.docx')).toBeInTheDocument();
      });
    });

    it('renders integration status section', () => {
      renderDashboard();
      
      expect(screen.getByText('Integration Status')).toBeInTheDocument();
      mockIntegrationStatus.forEach(integration => {
        expect(screen.getByText(integration.name)).toBeInTheDocument();
        expect(screen.getByText(integration.status)).toBeInTheDocument();
      });
    });

    it('renders quick actions', () => {
      renderDashboard();
      
      const actions = ['Sort Files', 'Sync Email', 'Upload Files', 'New Calendar Event'];
      actions.forEach(action => {
        expect(screen.getByText(action)).toBeInTheDocument();
      });
    });

    it('renders AI assistant section', () => {
      renderDashboard();
      
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/type a command or ask a question/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles file sorting', async () => {
      renderDashboard();
      
      const sortButton = screen.getByText('Sort Files');
      fireEvent.click(sortButton);
      
      await waitFor(() => {
        expect(screen.getByText('Files sorted by type')).toBeInTheDocument();
      });
    });

    it('handles file search', async () => {
      renderDashboard();
      
      const searchInput = screen.getByPlaceholderText(/type a command or ask a question/i);
      fireEvent.change(searchInput, { target: { value: 'report' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 13 });
      
      await waitFor(() => {
        expect(screen.getByText('Q2 Report.pdf')).toBeInTheDocument();
        expect(screen.queryByText('Meeting Notes.docx')).not.toBeInTheDocument();
      });
    });

    it('handles file actions', async () => {
      renderDashboard();
      
      const downloadButton = screen.getAllByRole('button', { name: /download/i })[0];
      const shareButton = screen.getAllByRole('button', { name: /share/i })[0];
      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
      
      fireEvent.click(downloadButton);
      fireEvent.click(shareButton);
      fireEvent.click(deleteButton);
      
      // Verify action handlers were called
      // Add specific expectations based on your implementation
    });

    it('handles new task creation', () => {
      renderDashboard();
      
      const newTaskButton = screen.getByRole('button', { name: /new task/i });
      fireEvent.click(newTaskButton);
      
      // Verify new task modal or form appears
      // Add specific expectations based on your implementation
    });
  });

  describe('Responsive Design', () => {
    it('adjusts layout for mobile screens', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      renderDashboard();
      
      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toHaveClass('lg:grid-cols-3');
    });

    it('adjusts layout for tablet screens', () => {
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));
      
      renderDashboard();
      
      const statsGrid = screen.getByTestId('stats-grid');
      expect(statsGrid).toHaveClass('md:grid-cols-2');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when file loading fails', async () => {
      const { getFiles } = require('../../controllers/file.controller');
      getFiles.mockRejectedValueOnce(new Error('Failed to load files'));
      
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load files/i)).toBeInTheDocument();
      });
    });

    it('displays error message when integration status loading fails', async () => {
      renderDashboard();
      
      // Mock integration status loading failure
      // Add specific expectations based on your implementation
    });
  });

  describe('Performance', () => {
    it('lazy loads file list', async () => {
      renderDashboard();
      
      const fileList = screen.getByTestId('file-list');
      expect(fileList).toHaveAttribute('loading', 'lazy');
    });

    it('implements infinite scrolling for file list', async () => {
      renderDashboard();
      
      const fileList = screen.getByTestId('file-list');
      fireEvent.scroll(fileList);
      
      // Verify more files are loaded
      // Add specific expectations based on your implementation
    });
  });
});
