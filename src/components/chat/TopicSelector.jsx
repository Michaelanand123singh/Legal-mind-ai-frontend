import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../services/api';
import { formatLegalAreaName } from '../../utils/helpers';

const TopicSelector = ({ onTopicChange, currentTopic }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await chatAPI.getChatTopics();
        setTopics(response.topics || []);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleTopicChange = (e) => {
    const topicId = e.target.value;
    onTopicChange(topicId || null);
  };

  if (loading) {
    return (
      <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
    );
  }

  return (
    <select
      value={currentTopic || ''}
      onChange={handleTopicChange}
      className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="">All Topics</option>
      {topics.map((topic) => (
        <option key={topic.id} value={topic.id}>
          {topic.name}
        </option>
      ))}
    </select>
  );
};

export default TopicSelector;