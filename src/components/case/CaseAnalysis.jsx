import React from 'react';

const CaseAnalysis = ({ analysis, analysisType }) => {
  if (!analysis) return null;

  const renderIRAC = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-800">{analysis.issue}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Rule</h3>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-800">{analysis.rule}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Application</h3>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-gray-800">{analysis.application}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Conclusion</h3>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-800">{analysis.conclusion}</p>
        </div>
      </div>

      {analysis.key_facts && analysis.key_facts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Facts</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-1">
              {analysis.key_facts.map((fact, index) => (
                <li key={index} className="text-gray-800">{fact}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {analysis.legal_principles && analysis.legal_principles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Principles</h3>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-1">
              {analysis.legal_principles.map((principle, index) => (
                <li key={index} className="text-gray-800">{principle}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderGenericAnalysis = () => (
    <div className="space-y-4">
      {Object.entries(analysis).map(([key, value]) => {
        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                {key.replace(/_/g, ' ')}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-1">
                  {value.map((item, index) => (
                    <li key={index} className="text-gray-800">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        } else if (typeof value === 'string') {
          return (
            <div key={key}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                {key.replace(/_/g, ' ')}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{value}</p>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {analysisType === 'irac' ? 'IRAC Analysis' : 'Case Analysis'}
        </h2>
        <div className="text-sm text-gray-500">
          Generated on {new Date().toLocaleDateString()}
        </div>
      </div>

      {analysisType === 'irac' ? renderIRAC() : renderGenericAnalysis()}
    </div>
  );
};

export default CaseAnalysis;