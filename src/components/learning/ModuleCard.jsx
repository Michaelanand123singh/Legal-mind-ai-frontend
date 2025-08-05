import React from 'react';
import ProgressBar from './ProgressBar';
import { calculateProgress } from '../../utils/helpers';

const ModuleCard = ({ module, onSelectModule, progress = {} }) => {
  const completedLessons = Object.values(progress).filter(lesson => lesson.completed).length;
  const totalLessons = module.lessons ? module.lessons.length : 0;
  const progressPercentage = calculateProgress(completedLessons, totalLessons);

  return (
    <div 
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6"
      onClick={() => onSelectModule(module)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {module.title || module.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {module.description}
          </p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">{module.icon || '📚'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-900">
            {completedLessons}/{totalLessons} lessons
          </span>
        </div>
        
        <ProgressBar progress={progressPercentage} />
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{module.difficulty || 'Intermediate'}</span>
          <span>{module.duration || '2-3 hours'}</span>
        </div>
      </div>

      {progressPercentage === 100 && (
        <div className="mt-3 flex items-center text-green-600 text-sm">
          <span className="mr-1">✓</span>
          Completed
        </div>
      )}
    </div>
  );
};

export default ModuleCard;