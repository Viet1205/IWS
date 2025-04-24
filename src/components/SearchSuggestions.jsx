import React from 'react';

const SearchSuggestions = ({ suggestions, onSuggestionClick }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="search-suggestions">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="search-suggestion-item"
          onClick={() => onSuggestionClick(suggestion)}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ef6c00/search.png"
            alt="Search"
            className="search-suggestion-icon"
          />
          <div className="suggestion-content">
            <span className="suggestion-name">{suggestion.name}</span>
            <span className="suggestion-category">{suggestion.category}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchSuggestions; 