 import React, { useState, useEffect } from 'react';
import { casesAPI } from '../services/api';
import { useApi, useAsyncAction } from '../hooks/useApi';
import CaseViewer from '../components/case/CaseViewer';
import Loading from '../components/layout/Loading';
import { formatLegalAreaName, formatDate, truncateText } from '../utils/helpers';

const Cases = () => {
  const [activeTab, setActiveTab] = useState('analyze');
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userAnalyses, setUserAnalyses] = useState([]);

  // API hooks
  const { data: legalAreas, loading: areasLoading } = useApi(casesAPI.getLegalAreas);
  const { data: analysesData, loading: analysesLoading, refetch: refetchAnalyses } = useApi(casesAPI.getUserAnalyses);
  const { loading: searchLoading, execute: executeSearch } = useAsyncAction();
  const { loading: casesLoading, execute: executeCasesSearch } = useAsyncAction();

  useEffect(() => {
    if (analysesData?.analyses) {
      setUserAnalyses(analysesData.analyses);
    }
  }, [analysesData]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await executeSearch(casesAPI.searchCases, searchQuery);
      setSearchResults(results.cases || []);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    }
  };

  const handleAreaFilter = async (area) => {
    setSelectedArea(area);
    if (area === 'all') {
      setSearchResults([]);
      return;
    }

    try {
      const results = await executeCasesSearch(casesAPI.getCasesByArea, area);
      setSearchResults(results.cases || []);
    } catch (err) {
      console.error('Failed to fetch cases by area:', err);
      setSearchResults([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const tabs = [
    { id: 'analyze', label: 'Analyze Case', icon: '🔍' },
    { id: 'browse', label: 'Browse Cases', icon: '📚' },
    { id: 'history', label: 'My Analyses', icon: '📋' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Case Analysis & Research
        </h1>
        <p className="text-gray-600">
          Analyze legal cases using the IRAC method, browse case databases, and manage your analysis history.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Analyze Case Tab */}
          {activeTab === 'analyze' && (
            <CaseViewer onAnalysisComplete={refetchAnalyses} />
          )}

          {/* Browse Cases Tab */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Search cases by name, topic, or keywords..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading || !searchQuery.trim()}
                    className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {/* Area Filters */}
                {areasLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">Loading areas...</div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAreaFilter('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedArea === 'all'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Areas
                    </button>
                    {legalAreas?.areas?.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => handleAreaFilter(area.id)}
                        disabled={casesLoading}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedArea === area.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {formatLegalAreaName(area.name || area.id)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Results */}
              {(searchLoading || casesLoading) && (
                <Loading size="medium" text="Searching cases..." />
              )}

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Search Results ({searchResults.length})
                  </h3>
                  <div className="grid gap-4">
                    {searchResults.map((caseItem, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {caseItem.title || caseItem.name || `Case ${index + 1}`}
                          </h4>
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                            {formatLegalAreaName(caseItem.area_of_law || 'General')}
                          </span>
                        </div>
                        {caseItem.citation && (
                          <p className="text-sm text-gray-600 mb-2">{caseItem.citation}</p>
                        )}
                        <p className="text-gray-700 mb-3">
                          {truncateText(caseItem.summary || caseItem.description || 'No summary available', 200)}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {caseItem.year && <span>Year: {caseItem.year}</span>}
                            {caseItem.court && <span>Court: {caseItem.court}</span>}
                          </div>
                          <button className="px-3 py-1 bg-primary-500 text-white text-sm rounded hover:bg-primary-600">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !searchLoading && !casesLoading && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or browse by legal area.</p>
                </div>
              )}

              {!searchQuery && searchResults.length === 0 && selectedArea === 'all' && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Browse Legal Cases</h3>
                  <p className="text-gray-600">Search for specific cases or filter by legal area to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* My Analyses Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Your Case Analyses</h3>
                <button
                  onClick={refetchAnalyses}
                  className="px-4 py-2 text-primary-500 border border-primary-500 rounded-md hover:bg-primary-50"
                >
                  Refresh
                </button>
              </div>

              {analysesLoading ? (
                <Loading size="medium" text="Loading your analyses..." />
              ) : userAnalyses.length > 0 ? (
                <div className="grid gap-4">
                  {userAnalyses.map((analysis, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            Case Analysis #{index + 1}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Analyzed on {formatDate(analysis.created_at || new Date())}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {analysis.analysis_type?.toUpperCase() || 'IRAC'}
                        </span>
                      </div>
                      
                      {analysis.case_summary && (
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-700 mb-1">Case Summary:</h5>
                          <p className="text-gray-600 text-sm">
                            {truncateText(analysis.case_summary, 150)}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Method: {analysis.analysis_type || 'IRAC'}</span>
                          {analysis.confidence_score && (
                            <span>Confidence: {Math.round(analysis.confidence_score * 100)}%</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 text-primary-500 text-sm hover:bg-primary-50 rounded">
                            View Full Analysis
                          </button>
                          <button className="px-3 py-1 text-gray-500 text-sm hover:bg-gray-100 rounded">
                            Export
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
                  <p className="text-gray-600 mb-4">Start analyzing cases to see your history here.</p>
                  <button
                    onClick={() => setActiveTab('analyze')}
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                  >
                    Analyze Your First Case
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cases;