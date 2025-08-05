import React, { useState, useEffect } from 'react';
import { learningAPI } from '../services/api';
import { useApi, useAsyncAction } from '../hooks/useApi';
import ModuleCard from '../components/learning/ModuleCard';
import ProgressBar from '../components/learning/ProgressBar';
import Loading from '../components/layout/Loading';
import { calculateProgress, formatDate, capitalizeFirstLetter } from '../utils/helpers';

const Learning = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  // API hooks
  const { data: modulesData, loading: modulesLoading, refetch: refetchModules } = useApi(learningAPI.getLearningModules);
  const { data: progressData, loading: progressLoading, refetch: refetchProgress } = useApi(learningAPI.getUserProgress);
  const { data: statsData, loading: statsLoading } = useApi(learningAPI.getLearningStats);
  const { loading: moduleContentLoading, execute: fetchModuleContent } = useAsyncAction();
  const { loading: progressUpdateLoading, execute: updateProgress } = useAsyncAction();

  useEffect(() => {
    if (progressData?.progress) {
      setUserProgress(progressData.progress);
    }
  }, [progressData]);

  const handleSelectModule = async (module) => {
    setSelectedModule(module);
    setSelectedLesson(null);

    try {
      const moduleContent = await fetchModuleContent(learningAPI.getModuleContent, module.id);
      setSelectedModule({ ...module, ...moduleContent });
    } catch (err) {
      console.error('Failed to fetch module content:', err);
    }
  };

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleCompleteLesson = async (moduleId, lessonId) => {
    try {
      await updateProgress(learningAPI.updateProgress, moduleId, lessonId, true);
      
      // Update local progress state
      setUserProgress(prev => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          [lessonId]: { completed: true, completed_at: new Date().toISOString() }
        }
      }));

      // Refetch progress and stats
      refetchProgress();
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setSelectedLesson(null);
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
  };

  // Filter and sort modules
  const getFilteredAndSortedModules = () => {
    if (!modulesData?.modules) return [];

    let filtered = modulesData.modules;

    // Filter by difficulty
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(module => 
        (module.difficulty || 'intermediate').toLowerCase() === filterDifficulty
      );
    }

    // Sort modules
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          const progressA = calculateProgress(
            Object.values(userProgress[a.id] || {}).filter(l => l.completed).length,
            a.lessons?.length || 0
          );
          const progressB = calculateProgress(
            Object.values(userProgress[b.id] || {}).filter(l => l.completed).length,
            b.lessons?.length || 0
          );
          return progressB - progressA;
        case 'alphabetical':
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        default: // 'recommended'
          return 0;
      }
    });

    return sorted;
  };

  const difficultyLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'progress', label: 'By Progress' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'difficulty', label: 'By Difficulty' },
  ];

  // Show lesson content view
  if (selectedLesson) {
    const moduleProgress = userProgress[selectedModule.id] || {};
    const lessonProgress = moduleProgress[selectedLesson.id] || {};
    const isCompleted = lessonProgress.completed;

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button onClick={handleBackToModules} className="hover:text-primary-500">
              Learning Modules
            </button>
            <span>›</span>
            <button onClick={handleBackToLessons} className="hover:text-primary-500">
              {selectedModule.title || selectedModule.name}
            </button>
            <span>›</span>
            <span className="text-gray-900">{selectedLesson.title}</span>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedLesson.title}
              </h1>
              <p className="text-gray-600">
                {selectedLesson.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isCompleted && (
                <span className="flex items-center text-green-600 text-sm">
                  <span className="mr-1">✓</span>
                  Completed
                </span>
              )}
              <button
                onClick={() => handleCompleteLesson(selectedModule.id, selectedLesson.id)}
                disabled={progressUpdateLoading || isCompleted}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isCompleted
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {progressUpdateLoading ? 'Updating...' : isCompleted ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>

          <div className="prose max-w-none">
            {selectedLesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
            ) : (
              <div className="space-y-4">
                <p>This lesson covers important concepts in {selectedModule.title}.</p>
                <h3>Key Learning Objectives:</h3>
                <ul>
                  <li>Understand the fundamental principles</li>
                  <li>Apply concepts to real-world scenarios</li>
                  <li>Analyze case studies and examples</li>
                  <li>Practice problem-solving techniques</li>
                </ul>
                <h3>Lesson Content:</h3>
                <p>Detailed lesson content would be loaded here from the backend...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show module detail view
  if (selectedModule) {
    const moduleProgress = userProgress[selectedModule.id] || {};
    const completedLessons = Object.values(moduleProgress).filter(lesson => lesson.completed).length;
    const totalLessons = selectedModule.lessons?.length || 0;
    const progressPercentage = calculateProgress(completedLessons, totalLessons);

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button onClick={handleBackToModules} className="hover:text-primary-500">
              Learning Modules
            </button>
            <span>›</span>
            <span className="text-gray-900">{selectedModule.title || selectedModule.name}</span>
          </div>
        </div>

        {/* Module Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedModule.title || selectedModule.name}
              </h1>
              <p className="text-gray-600 mb-4">
                {selectedModule.description}
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Difficulty: {capitalizeFirstLetter(selectedModule.difficulty || 'intermediate')}</span>
                <span>Duration: {selectedModule.duration || '2-3 hours'}</span>
                <span>Lessons: {totalLessons}</span>
              </div>
            </div>
            <div className="flex-shrink-0 ml-6">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-3xl">{selectedModule.icon || '📚'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedLessons}/{totalLessons} completed</span>
            </div>
            <ProgressBar progress={progressPercentage} showPercentage />
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lessons</h2>
          
          {moduleContentLoading ? (
            <Loading size="medium" text="Loading lessons..." />
          ) : selectedModule.lessons && selectedModule.lessons.length > 0 ? (
            <div className="space-y-3">
              {selectedModule.lessons.map((lesson, index) => {
                const lessonProgress = moduleProgress[lesson.id] || {};
                const isCompleted = lessonProgress.completed;
                const isLocked = index > 0 && !Object.values(moduleProgress).slice(0, index).every(l => l.completed);

                return (
                  <div
                    key={lesson.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isLocked 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'border-gray-200 hover:border-primary-300 cursor-pointer'
                    }`}
                    onClick={!isLocked ? () => handleSelectLesson(lesson) : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted 
                            ? 'bg-green-100 text-green-700'
                            : isLocked
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-primary-100 text-primary-700'
                        }`}>
                          {isCompleted ? '✓' : isLocked ? '🔒' : index + 1}
                        </div>
                        <div>
                          <h3 className={`font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                            {lesson.title}
                          </h3>
                          <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                            {lesson.description || 'Lesson description'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {lesson.duration && <span>{lesson.duration}</span>}
                        {isCompleted && lessonProgress.completed_at && (
                          <span>Completed {formatDate(lessonProgress.completed_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>No lessons available for this module yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show modules overview
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Learning Modules
        </h1>
        <p className="text-gray-600">
          Explore structured legal education modules designed to build your knowledge systematically.
        </p>
      </div>

      {/* Learning Stats */}
      {statsData && !statsLoading && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Learning Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500 mb-1">
                {statsData.completed_lessons || 0}
              </div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">
                {statsData.total_lessons || 0}
              </div>
              <div className="text-sm text-gray-600">Total Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500 mb-1">
                {Math.round(statsData.completion_rate || 0)}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-1">
                {statsData.active_modules || 0}
              </div>
              <div className="text-sm text-gray-600">Active Modules</div>
            </div>
          </div>
          {statsData.completion_rate > 0 && (
            <div className="mt-4">
              <ProgressBar progress={statsData.completion_rate} showPercentage />
            </div>
          )}
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {difficultyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={refetchModules}
              className="px-4 py-2 text-primary-500 border border-primary-500 rounded-md hover:bg-primary-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        {modulesLoading || progressLoading ? (
          <Loading size="large" text="Loading learning modules..." />
        ) : (
          <>
            {getFilteredAndSortedModules().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredAndSortedModules().map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    progress={userProgress[module.id] || {}}
                    onSelectModule={handleSelectModule}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {filterDifficulty !== 'all' || sortBy !== 'recommended'
                    ? 'No modules match your filters'
                    : 'No learning modules available'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filterDifficulty !== 'all' || sortBy !== 'recommended'
                    ? 'Try adjusting your filters to see more modules.'
                    : 'Learning modules will appear here once they are available.'}
                </p>
                {(filterDifficulty !== 'all' || sortBy !== 'recommended') && (
                  <button
                    onClick={() => {
                      setFilterDifficulty('all');
                      setSortBy('recommended');
                    }}
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Continue Learning Section */}
      {!modulesLoading && !progressLoading && getFilteredAndSortedModules().length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredAndSortedModules()
              .filter(module => {
                const moduleProgress = userProgress[module.id] || {};
                const completedLessons = Object.values(moduleProgress).filter(l => l.completed).length;
                const totalLessons = module.lessons?.length || 0;
                return completedLessons > 0 && completedLessons < totalLessons;
              })
              .slice(0, 4)
              .map((module) => {
                const moduleProgress = userProgress[module.id] || {};
                const completedLessons = Object.values(moduleProgress).filter(l => l.completed).length;
                const totalLessons = module.lessons?.length || 0;
                const progressPercentage = calculateProgress(completedLessons, totalLessons);

                return (
                  <div
                    key={module.id}
                    onClick={() => handleSelectModule(module)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {module.title || module.name}
                      </h3>
                      <span className="text-2xl">{module.icon || '📚'}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{completedLessons}/{totalLessons} lessons</span>
                      </div>
                      <ProgressBar progress={progressPercentage} />
                    </div>
                  </div>
                );
              })}
          </div>
          
          {getFilteredAndSortedModules().filter(module => {
            const moduleProgress = userProgress[module.id] || {};
            const completedLessons = Object.values(moduleProgress).filter(l => l.completed).length;
            const totalLessons = module.lessons?.length || 0;
            return completedLessons > 0 && completedLessons < totalLessons;
          }).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🎯</div>
              <p>No modules in progress. Start a new module to see your progress here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Learning;