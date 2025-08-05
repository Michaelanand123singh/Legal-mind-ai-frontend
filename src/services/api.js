import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API
export const chatAPI = {
  sendMessage: async (message, topic = null) => {
    const response = await api.post('/chat/', {
      message,
      topic,
    });
    return response.data;
  },

  getChatSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },

  getChatTopics: async () => {
    const response = await api.get('/chat/topics');
    return response.data;
  },
};

// Cases API
export const casesAPI = {
  analyzeCase: async (caseText, analysisType = 'irac') => {
    const response = await api.post('/cases/analyze', {
      case_text: caseText,
      analysis_type: analysisType,
    });
    return response.data;
  },

  getCasesByArea: async (areaOfLaw) => {
    const response = await api.get(`/cases/area/${areaOfLaw}`);
    return response.data;
  },

  searchCases: async (query) => {
    const response = await api.get('/cases/search', {
      params: { q: query },
    });
    return response.data;
  },

  getLegalAreas: async () => {
    const response = await api.get('/cases/areas');
    return response.data;
  },

  getUserAnalyses: async () => {
    const response = await api.get('/cases/analyses');
    return response.data;
  },
};

// Learning API
export const learningAPI = {
  getLearningModules: async () => {
    const response = await api.get('/learning/modules');
    return response.data;
  },

  getModuleContent: async (moduleId) => {
    const response = await api.get(`/learning/modules/${moduleId}`);
    return response.data;
  },

  updateProgress: async (moduleId, lessonId, completed = true) => {
    const response = await api.post('/learning/progress', {
      module_id: moduleId,
      lesson_id: lessonId,
      completed,
    });
    return response.data;
  },

  getUserProgress: async () => {
    const response = await api.get('/learning/progress');
    return response.data;
  },

  getLearningStats: async () => {
    const response = await api.get('/learning/stats');
    return response.data;
  },
};

// Search API
export const searchAPI = {
  search: async (query, type = 'all') => {
    const response = await api.get('/search/', {
      params: { q: query, type },
    });
    return response.data;
  },
};

export default api;