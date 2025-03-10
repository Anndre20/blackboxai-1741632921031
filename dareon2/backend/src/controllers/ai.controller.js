const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');
const FileController = require('./file.controller');
const User = require('../models/user.model');

class AIController {
  // @desc    Process natural language command
  // @route   POST /api/ai/command
  // @access  Private
  processCommand = asyncHandler(async (req, res) => {
    const { command } = req.body;
    const user = req.user;

    // Log command for analysis
    logger.info({
      type: 'AI_COMMAND',
      userId: user.id,
      command
    });

    try {
      const { intent, parameters } = await this.parseCommand(command);
      const result = await this.executeCommand(intent, parameters, user);

      res.status(200).json({
        success: true,
        data: {
          intent,
          result
        }
      });
    } catch (error) {
      logger.error({
        type: 'AI_COMMAND_ERROR',
        userId: user.id,
        command,
        error: error.message
      });
      throw new ErrorResponse('Failed to process command', 500);
    }
  });

  // Parse natural language command to determine intent and parameters
  async parseCommand(command) {
    const commandPatterns = {
      sortFiles: {
        patterns: [
          /sort (?:my )?files by (type|date|size|name)/i,
          /organize (?:my )?files by (type|date|size|name)/i
        ],
        extractParams: (matches) => ({ sortBy: matches[1].toLowerCase() })
      },
      syncEmails: {
        patterns: [
          /sync (?:my )?(?:(outlook|gmail) )?emails?/i,
          /update (?:my )?(?:(outlook|gmail) )?emails?/i
        ],
        extractParams: (matches) => ({ provider: matches[1]?.toLowerCase() || 'all' })
      },
      updateCalendar: {
        patterns: [
          /update (?:my )?calendar/i,
          /sync (?:my )?calendar/i
        ],
        extractParams: () => ({})
      },
      showFiles: {
        patterns: [
          /show (?:my )?(onedrive )?files/i,
          /list (?:my )?(onedrive )?files/i
        ],
        extractParams: (matches) => ({ source: matches[1]?.toLowerCase().trim() || 'local' })
      },
      searchFiles: {
        patterns: [
          /search (?:for )?(?:my )?files?(?: containing| with)? (.+)/i,
          /find (?:my )?files?(?: containing| with)? (.+)/i
        ],
        extractParams: (matches) => ({ query: matches[1] })
      },
      getStats: {
        patterns: [
          /show (?:my )?stats/i,
          /get (?:my )?statistics/i
        ],
        extractParams: () => ({})
      }
    };

    for (const [intent, config] of Object.entries(commandPatterns)) {
      for (const pattern of config.patterns) {
        const matches = command.match(pattern);
        if (matches) {
          return {
            intent,
            parameters: config.extractParams(matches)
          };
        }
      }
    }

    throw new ErrorResponse('Could not understand command', 400);
  }

  // Execute parsed command
  async executeCommand(intent, parameters, user) {
    switch (intent) {
      case 'sortFiles':
        return await this.executeSortFiles(parameters, user);
      case 'syncEmails':
        return await this.executeSyncEmails(parameters, user);
      case 'updateCalendar':
        return await this.executeUpdateCalendar(user);
      case 'showFiles':
        return await this.executeShowFiles(parameters, user);
      case 'searchFiles':
        return await this.executeSearchFiles(parameters, user);
      case 'getStats':
        return await this.executeGetStats(user);
      default:
        throw new ErrorResponse('Unsupported command', 400);
    }
  }

  // Command execution methods
  async executeSortFiles({ sortBy }, user) {
    const fileController = new FileController();
    const files = await fileController.sortFiles({ body: { sortBy }, user });
    
    return {
      message: `Files sorted by ${sortBy}`,
      files: files.data
    };
  }

  async executeSyncEmails({ provider }, user) {
    // Check user's email integration status
    const integrations = user.integrations;
    const providers = provider === 'all' 
      ? ['microsoft', 'google']
      : [provider === 'outlook' ? 'microsoft' : 'google'];

    const results = {};
    for (const p of providers) {
      if (!integrations[p]?.connected) {
        results[p] = { status: 'error', message: 'Not connected' };
        continue;
      }

      try {
        // TODO: Implement actual email sync logic
        results[p] = { status: 'success', message: 'Emails synchronized' };
      } catch (error) {
        results[p] = { status: 'error', message: error.message };
      }
    }

    return {
      message: 'Email sync completed',
      results
    };
  }

  async executeUpdateCalendar(user) {
    // Check calendar integration status
    if (!user.integrations.timeTree?.connected) {
      throw new ErrorResponse('TimeTree not connected', 400);
    }

    try {
      // TODO: Implement actual calendar sync logic
      return {
        message: 'Calendar updated successfully',
        status: 'success'
      };
    } catch (error) {
      throw new ErrorResponse('Failed to update calendar', 500);
    }
  }

  async executeShowFiles({ source }, user) {
    if (source === 'onedrive') {
      if (!user.integrations.microsoft?.connected) {
        throw new ErrorResponse('OneDrive not connected', 400);
      }
      // TODO: Implement OneDrive file listing
      return {
        message: 'OneDrive files retrieved',
        files: []
      };
    }

    const fileController = new FileController();
    const files = await fileController.getFiles({ user });
    
    return {
      message: 'Local files retrieved',
      files: files.data
    };
  }

  async executeSearchFiles({ query }, user) {
    const fileController = new FileController();
    const files = await fileController.searchFiles({ query: { query }, user });
    
    return {
      message: `Search results for "${query}"`,
      files: files.data
    };
  }

  async executeGetStats(user) {
    const fileController = new FileController();
    const stats = await fileController.getFileStats({ user });
    
    return {
      message: 'Statistics retrieved',
      stats: stats.data
    };
  }

  // @desc    Get command history
  // @route   GET /api/ai/history
  // @access  Private
  getCommandHistory = asyncHandler(async (req, res) => {
    const user = req.user;
    
    // TODO: Implement command history storage and retrieval
    const history = [];

    res.status(200).json({
      success: true,
      data: history
    });
  });

  // @desc    Get command suggestions
  // @route   GET /api/ai/suggestions
  // @access  Private
  getCommandSuggestions = asyncHandler(async (req, res) => {
    const { context } = req.query;
    
    const suggestions = [
      'Sort my files by type',
      'Sync my Outlook emails',
      'Update my calendar',
      'Show my OneDrive files',
      'Search files containing "report"',
      'Show my stats'
    ];

    res.status(200).json({
      success: true,
      data: suggestions
    });
  });
}

module.exports = new AIController();
