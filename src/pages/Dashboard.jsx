import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learningAPI, casesAPI, chatAPI } from '../services/api';
import ProgressBar from '../components/learning/ProgressBar';
import Loading from '../components/layout/Loading';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data with individual error handling
        const statsPromise = learningAPI.getLearningStats().catch(err => {
          console.warn('Learning stats failed:', err);
          return {
            total_lessons: 6,
            completed_lessons: 0,
            completion_rate: 0.0
          };
        });

        const sessionsPromise = chatAPI.getChatSessions().catch(err => {
          console.warn('Chat sessions failed:', err);
          return { sessions: [] };
        });

        const analysesPromise = casesAPI.getUserAnalyses().catch(err => {
          console.warn('User analyses failed:', err);
          return { analyses: [] };
        });

        const [statsData, sessionsData, analysesData] = await Promise.all([
          statsPromise,
          sessionsPromise,
          analysesPromise
        ]);

        // Set stats safely
        setStats(statsData);

        // Fix: sessionsData is an object {sessions: []}
        const sessions = sessionsData?.sessions || [];
        setRecentSessions(Array.isArray(sessions) ? sessions.slice(0, 3) : []);

        // Fix: analysesData is an object {analyses: []}
        const analyses = analysesData?.analyses || [];
        setRecentAnalyses(Array.isArray(analyses) ? analyses.slice(0, 3) : []);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set safe defaults
        setStats({
          total_lessons: 6,
          completed_lessons: 0,
          completion_rate: 0.0
        });
        setRecentSessions([]);
        setRecentAnalyses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading size="large" text="Loading dashboard..." />;
  }

  const quickActions = [
    {
      title: 'Ask AI Tutor',
      description: 'Get instant help with legal concepts',
      icon: '🤖',
      link: '/tutor',
      color: 'bg-blue-500',
    },
    {
      title: 'Analyze Case',
      description: 'Use IRAC method for case analysis',
      icon: '📚',
      link: '/cases',
      color: 'bg-green-500',
    },
    {
      title: 'Continue Learning',
      description: 'Resume your learning modules',
      icon: '🎓',
      link: '/learning',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to LegalMind AI
        </h1>
        <p className="text-gray-600">
          Your AI-powered legal education companion. Continue your learning journey or explore new legal concepts.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 block"
          >
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mr-4`}>
                <span className="text-2xl">{action.icon}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500 mb-1">
                {stats.completed_lessons || 0}
              </div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">
                {stats.total_lessons || 0}
              </div>
              <div className="text-sm text-gray-600">Total Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500 mb-1">
                {Math.round(stats.completion_rate || 0)}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar progress={stats.completion_rate || 0} showPercentage />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chat Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Conversations</h2>
            <Link to="/tutor" className="text-primary-500 hover:text-primary-600 text-sm">
              View all
            </Link>
          </div>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div key={session.id || index} className="border-l-4 border-primary-500 pl-4 py-2">
                  <div className="text-sm font-medium text-gray-900">
                    {session.topic || 'General Discussion'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.updated_at 
                      ? new Date(session.updated_at).toLocaleDateString()
                      : new Date().toLocaleDateString()
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm">No recent conversations</p>
              <Link to="/tutor" className="text-primary-500 hover:text-primary-600 text-sm">
                Start a conversation
              </Link>
            </div>
          )}
        </div>

        {/* Recent Case Analyses */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Analyses</h2>
            <Link to="/cases" className="text-primary-500 hover:text-primary-600 text-sm">
              View all
            </Link>
          </div>
          {recentAnalyses.length > 0 ? (
            <div className="space-y-3">
              {recentAnalyses.map((analysis, index) => (
                <div key={analysis.id || index} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="text-sm font-medium text-gray-900">
                    {analysis.title || `Case Analysis #${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {analysis.created_at 
                      ? new Date(analysis.created_at).toLocaleDateString()
                      : new Date().toLocaleDateString()
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-sm">No recent analyses</p>
              <Link to="/cases" className="text-primary-500 hover:text-primary-600 text-sm">
                Analyze a case
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;