import api from '../config/api';
import logger from '../utils/logger';

/**
 * Chat Service
 * Frontend service for handling AI tutor chat and message persistence
 */

/**
 * Send message to AI tutor (SECURE - uses backend endpoint)
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages in conversation
 * @param {string|null} lessonId - Optional lesson ID for context
 * @param {string} sessionId - Session ID for grouping messages
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export const sendAIMessage = async (message, conversationHistory = [], lessonId = null, sessionId = '') => {
  try {
    const response = await api.post('/chat/send', {
      message,
      conversationHistory,
      lessonId,
      sessionId
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    logger.error('Send AI message error:', error);
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      return {
        success: false,
        message: error.response?.data?.message || 'Too many requests. Please try again later.',
        rateLimited: true
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get AI response. Please try again.',
      devError: error.response?.data?.devError, // Capture detailed error
      data: null
    };
  }
};

/**
 * Save a chat message to database
 * @param {string} sessionId - Session ID
 * @param {object} message - Message object with text and sender
 * @param {string|null} lessonId - Optional lesson ID
 * @param {string|null} lessonTitle - Optional lesson title
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export const saveMessage = async (sessionId, message, lessonId = null, lessonTitle = null) => {
  try {
    const response = await api.post('/chat/save', {
      sessionId,
      message,
      lessonId,
      lessonTitle
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    logger.error('Save message error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to save message',
      data: null
    };
  }
};

/**
 * Get chat history by session ID
 * @param {string} sessionId - Session ID
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
 */
export const getChatHistory = async (sessionId, limit = 50) => {
  try {
    const response = await api.get(`/chat/history/${sessionId}?limit=${limit}`);
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.count || 0
    };
  } catch (error) {
    logger.error('Get chat history error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to retrieve chat history',
      data: []
    };
  }
};

/**
 * Get all chat sessions for authenticated user
 * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
 */
export const getUserSessions = async () => {
  try {
    const response = await api.get('/chat/sessions');
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    logger.error('Get user sessions error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to retrieve sessions',
      data: []
    };
  }
};

/**
 * Delete a chat session
 * @param {string} sessionId - Session ID to delete
 * @returns {Promise<{success: boolean, message?: string, deletedCount?: number}>}
 */
export const deleteSession = async (sessionId) => {
  try {
    const response = await api.delete(`/chat/session/${sessionId}`);
    return {
      success: true,
      message: response.data.message,
      deletedCount: response.data.deletedCount
    };
  } catch (error) {
    logger.error('Delete session error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete session',
      deletedCount: 0
    };
  }
};
