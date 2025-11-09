import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const conversationService = {
  // Get all conversations
  getAll: (params = {}) => api.get('/conversations/', { params }),
  
  // Get single conversation
  getById: (id) => api.get(`/conversations/${id}/`),
  
  // Create conversation
  create: (data) => api.post('/conversations/', data),
  
  // End conversation
  end: (id) => api.post(`/conversations/${id}/end/`),
  
  // Add message
  addMessage: (id, data) => api.post(`/conversations/${id}/messages/`, data),
  
  // Query past conversations
  query: (data) => api.post('/conversations/query/', data),
  
  // Semantic search
  search: (query, limit = 10) => api.get('/conversations/search/', { params: { q: query, limit } }),
  
  // Export conversation
  export: (id, format) => api.post(`/conversations/${id}/export/`, { format }, { responseType: 'blob' }),
  
  // Share conversation
  share: (id) => api.post(`/conversations/${id}/share/`),
  
  // Get shared conversation
  getShared: (token) => api.get(`/conversations/shared/${token}/`),
  
  // Get analytics
  getAnalytics: (params = {}) => api.get('/conversations/analytics/', { params }),
}

export const messageService = {
  // Get messages
  getAll: (params = {}) => api.get('/messages/', { params }),
  
  // Add reaction
  react: (id, emoji) => api.post(`/messages/${id}/react/`, { emoji }),
  
  // Toggle bookmark
  bookmark: (id) => api.post(`/messages/${id}/bookmark/`),
}

export default api

