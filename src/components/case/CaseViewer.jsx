import React, { useState } from 'react';
import CaseAnalysis from './CaseAnalysis';
import { casesAPI } from '../../services/api';
import { useAsyncAction } from '../../hooks/useApi';

const CaseViewer = () => {
  const [caseText, setCaseText] = useState('');
  const [analysisType, setAnalysisType] = useState('irac');
  const [analysis, setAnalysis] = useState(null);
  const { loading, error, execute } = useAsyncAction();

  const handleAnalyze = async () => {
    if (!caseText.trim()) return;

    try {
      const result = await execute(casesAPI.analyzeCase, caseText, analysisType);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const handleClear = () => {
    setCaseText('');
    setAnalysis(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Case Analysis Tool</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="caseText" className="block text-sm font-medium text-gray-700 mb-2">
              Case Text
            </label>
            <textarea
              id="caseText"
              value={caseText}
              onChange={(e) => setCaseText(e.target.value)}
              placeholder="Paste the case text here for analysis..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="analysisType" className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Type
              </label>
              <select
                id="analysisType"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="irac">IRAC Method</option>
                <option value="brief">Case Brief</option>
                <option value="summary">Summary</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Clear
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!caseText.trim() || loading}
                className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze Case'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <CaseAnalysis analysis={analysis} analysisType={analysisType} />
      )}
    </div>
  );
};

export default CaseViewer;