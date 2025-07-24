import React, { useState, useCallback } from 'react';
import { Search, Building, MapPin, Globe, Users, TrendingUp } from 'lucide-react';

const CompanySearch = ({ onCompanySelect, selectedCompany }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // Mock company data - in a real app, you'd use an API
  const mockCompanies = [
    {
      id: 1,
      name: 'Netflix',
      domain: 'netflix.com',
      industry: 'Entertainment',
      location: 'Los Gatos, CA',
      employees: '12,000+',
      description: 'Streaming entertainment service',
      logo: 'https://logo.clearbit.com/netflix.com'
    },
    {
      id: 2,
      name: 'Uber',
      domain: 'uber.com',
      industry: 'Transportation',
      location: 'San Francisco, CA',
      employees: '32,000+',
      description: 'Ride-sharing and delivery platform',
      logo: 'https://logo.clearbit.com/uber.com'
    },
    {
      id: 3,
      name: 'Google',
      domain: 'google.com',
      industry: 'Technology',
      location: 'Mountain View, CA',
      employees: '156,500+',
      description: 'Search engine and technology company',
      logo: 'https://logo.clearbit.com/google.com'
    },
    {
      id: 4,
      name: 'Microsoft',
      domain: 'microsoft.com',
      industry: 'Technology',
      location: 'Redmond, WA',
      employees: '221,000+',
      description: 'Software and cloud services',
      logo: 'https://logo.clearbit.com/microsoft.com'
    },
    {
      id: 5,
      name: 'Apple',
      domain: 'apple.com',
      industry: 'Technology',
      location: 'Cupertino, CA',
      employees: '164,000+',
      description: 'Consumer electronics and software',
      logo: 'https://logo.clearbit.com/apple.com'
    }
  ];

  const searchCompanies = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter mock data - in real app, this would be an API call
      const filtered = mockCompanies.filter(company =>
        company.name.toLowerCase().includes(query.toLowerCase()) ||
        company.domain.toLowerCase().includes(query.toLowerCase()) ||
        company.industry.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (err) {
      setError('Failed to search companies');
      console.error('Company search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    searchCompanies(searchTerm);
  }, [searchTerm, searchCompanies]);

  const handleCompanySelect = (company) => {
    onCompanySelect(company);
    setSearchResults([]);
    setSearchTerm(company.name);
  };

  const clearSelection = () => {
    onCompanySelect(null);
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a company..."
            className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="submit"
              disabled={isSearching}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((company) => (
              <button
                key={company.id}
                onClick={() => handleCompanySelect(company)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
              >
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {company.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {company.industry} • {company.location}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Company Display */}
      {selectedCompany && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={selectedCompany.logo}
                alt={`${selectedCompany.name} logo`}
                className="w-10 h-10 rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {selectedCompany.name}
                </h3>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <div className="flex items-center space-x-1">
                    <Building className="w-3 h-3" />
                    <span>{selectedCompany.industry}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedCompany.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{selectedCompany.employees}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {selectedCompany.description}
          </p>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default CompanySearch; 