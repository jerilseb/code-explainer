import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import '../style.css';

interface Props {
  explanation: string;
  loading: boolean;
  onChangeApiKey?: () => void;
}

const ExplanationDisplay: React.FC<Props> = ({ explanation, loading, onChangeApiKey }) => {
  // Check if the explanation is an error message
  const isError = explanation.startsWith('Error:');
  const isApiKeyError = isError && explanation.includes('API key');

  return (
    <div className="explanation-container">
      <h2>Code Explanation</h2>
      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Generating explanation...</p>
        </div>
      ) : (
        explanation ? (
          <div className="explanation-content">
            {isError ? (
              <div className="error-message">
                {explanation}
                {isApiKeyError && onChangeApiKey && (
                  <div className="error-action">
                    <button onClick={onChangeApiKey} className="change-api-key-button">
                      Change API Key
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="markdown-content">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            )}
          </div>
        ) : (
          <p>Waiting for explanation to be generated...</p>
        )
      )}
    </div>
  );
};

export default ExplanationDisplay;