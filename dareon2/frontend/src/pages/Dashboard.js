import React, { useState } from 'react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { name: 'Files Managed', value: '2,543', icon: 'fas fa-file' },
    { name: 'Storage Used', value: '45.2 GB', icon: 'fas fa-database' },
    { name: 'Active Integrations', value: '4', icon: 'fas fa-plug' },
    { name: 'Tasks Completed', value: '156', icon: 'fas fa-check-circle' }
  ];

  const recentFiles = [
    { name: 'Q2 Report.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago' },
    { name: 'Meeting Notes.docx', type: 'Document', size: '542 KB', modified: '5 hours ago' },
    { name: 'Budget 2023.xlsx', type: 'Spreadsheet', size: '1.2 MB', modified: 'Yesterday' },
    { name: 'Presentation.pptx', type: 'Presentation', size: '4.8 MB', modified: '2 days ago' }
  ];

  const integrationStatus = [
    { name: 'Microsoft Outlook', status: 'Connected', icon: 'fab fa-microsoft' },
    { name: 'Gmail', status: 'Connected', icon: 'fab fa-google' },
    { name: 'OneDrive', status: 'Connected', icon: 'fab fa-microsoft' },
    { name: 'TimeTree', status: 'Pending', icon: 'fas fa-calendar' }
  ];

  const quickActions = [
    { name: 'Sort Files', icon: 'fas fa-sort', action: () => console.log('Sort files') },
    { name: 'Sync Email', icon: 'fas fa-sync', action: () => console.log('Sync email') },
    { name: 'Upload Files', icon: 'fas fa-upload', action: () => console.log('Upload files') },
    { name: 'New Calendar Event', icon: 'fas fa-calendar-plus', action: () => console.log('New event') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="btn btn-primary">
                <i className="fas fa-plus mr-2"></i>
                New Task
              </button>
              <button className="btn btn-secondary">
                <i className="fas fa-cog mr-2"></i>
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className={`${stat.icon} text-2xl text-blue-600`}></i>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">{stat.name}</div>
                  <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Files */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Files</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Size</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Modified</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentFiles.map((file, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <i className="fas fa-file text-blue-600 mr-2"></i>
                              {file.name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500">{file.type}</td>
                          <td className="py-3 px-4 text-gray-500">{file.size}</td>
                          <td className="py-3 px-4 text-gray-500">{file.modified}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="text-gray-400 hover:text-blue-600">
                                <i className="fas fa-download"></i>
                              </button>
                              <button className="text-gray-400 hover:text-blue-600">
                                <i className="fas fa-share"></i>
                              </button>
                              <button className="text-gray-400 hover:text-red-600">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
                >
                  <i className={`${action.icon} text-2xl text-blue-600 mb-2`}></i>
                  <div className="text-sm font-medium text-gray-900">{action.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Integration Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h2>
                <div className="space-y-4">
                  {integrationStatus.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <i className={`${integration.icon} text-xl text-gray-700 mr-3`}></i>
                        <span className="font-medium text-gray-900">{integration.name}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        integration.status === 'Connected' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {integration.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary w-full mt-4">
                  <i className="fas fa-plus mr-2"></i>
                  Add Integration
                </button>
              </div>
            </div>

            {/* AI Assistant Quick Access */}
            <div className="bg-white rounded-lg shadow mt-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <input
                    type="text"
                    placeholder="Type a command or ask a question..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">
                      Sort files by type
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">
                      Sync emails
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">
                      Update calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
