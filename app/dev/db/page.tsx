'use client';

import { useEffect, useState } from 'react';
import { personas } from '@/lib/personas';

type HealthData = {
  connectivity: {
    status: string;
    timestamp: string;
  };
  counts: {
    total_events: number;
    upcoming_public_events: number;
    tags: number;
    event_tags: number;
    tag_categories: number;
  };
  schema: {
    events_columns: Array<{
      column_name: string;
      data_type: string;
      is_nullable: string;
    }>;
  };
  tag_categories: Array<{
    id: number;
    name: string;
    tags: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
  }>;
  sample_events: Array<{
    id: number;
    title: string;
    starts_at: string;
    visibility: string;
    created_at: string;
  }>;
  errors: {
    [key: string]: string | undefined;
  };
};

export default function DevDatabasePage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await fetch('/api/dev/db-health');
        const result = await response.json();
        
        if (result.ok) {
          setHealthData(result.data);
        } else {
          setError(result.error || 'Failed to fetch database health');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Health Dashboard</h1>
        <p>Loading database information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Health Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Health Dashboard</h1>
        <p>No data available</p>
      </div>
    );
  }

  // Check persona slugs against actual tags
  const musicTags = healthData.tag_categories.find(cat => cat.name === 'Music')?.tags || [];
  const vibeTags = healthData.tag_categories.find(cat => cat.name === 'Vibe')?.tags || [];
  
  const personaValidation = personas.map(persona => {
    const musicTag = musicTags.find(tag => tag.slug === persona.musicSlug);
    const vibeTag = vibeTags.find(tag => tag.slug === persona.vibeSlug);
    
    return {
      ...persona,
      musicTag,
      vibeTag,
      isValid: !!(musicTag && vibeTag),
    };
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Health Dashboard</h1>
      <p className="text-gray-600 mb-8">Development-only dashboard showing database status and content</p>

      {/* Connectivity Status */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
        <strong>✅ Database Connected</strong>
        <span className="ml-2 text-sm">({healthData.connectivity.timestamp})</span>
      </div>

      {/* Table Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-700">Total Events</h3>
          <p className="text-2xl font-bold text-blue-600">{healthData.counts.total_events}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-700">Upcoming Public Events</h3>
          <p className="text-2xl font-bold text-green-600">{healthData.counts.upcoming_public_events}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-700">Tags</h3>
          <p className="text-2xl font-bold text-purple-600">{healthData.counts.tags}</p>
        </div>
      </div>

      {/* Persona Validation */}
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-xl font-bold mb-4">Persona Slug Validation</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Age</th>
                <th className="px-4 py-2 text-left">Music Slug</th>
                <th className="px-4 py-2 text-left">Music Tag</th>
                <th className="px-4 py-2 text-left">Vibe Slug</th>
                <th className="px-4 py-2 text-left">Vibe Tag</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {personaValidation.map((persona, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{persona.age}</td>
                  <td className="px-4 py-2 font-mono text-sm">{persona.musicSlug}</td>
                  <td className="px-4 py-2">
                    {persona.musicTag ? (
                      <span className="text-green-600">✅ {persona.musicTag.name}</span>
                    ) : (
                      <span className="text-red-600">❌ Not found</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm">{persona.vibeSlug}</td>
                  <td className="px-4 py-2">
                    {persona.vibeTag ? (
                      <span className="text-green-600">✅ {persona.vibeTag.name}</span>
                    ) : (
                      <span className="text-red-600">❌ Not found</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {persona.isValid ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Valid</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Invalid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tag Categories */}
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-xl font-bold mb-4">Tag Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthData.tag_categories.map(category => (
            <div key={category.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
              <div className="space-y-1">
                {category.tags.map(tag => (
                  <div key={tag.id} className="flex justify-between text-sm">
                    <span>{tag.name}</span>
                    <code className="text-gray-500">{tag.slug}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Events */}
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Events (Sample)</h2>
        {healthData.sample_events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Starts At</th>
                  <th className="px-4 py-2 text-left">Visibility</th>
                  <th className="px-4 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {healthData.sample_events.map(event => (
                  <tr key={event.id} className="border-t">
                    <td className="px-4 py-2">{event.id}</td>
                    <td className="px-4 py-2">{event.title}</td>
                    <td className="px-4 py-2">{new Date(event.starts_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        event.visibility === 'public' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.visibility}
                      </span>
                    </td>
                    <td className="px-4 py-2">{new Date(event.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No events found in database</p>
        )}
      </div>

      {/* Database Schema */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-bold mb-4">Events Table Schema</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Column</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Nullable</th>
              </tr>
            </thead>
            <tbody>
              {healthData.schema.events_columns.map(column => (
                <tr key={column.column_name} className="border-t">
                  <td className="px-4 py-2 font-mono text-sm">{column.column_name}</td>
                  <td className="px-4 py-2">{column.data_type}</td>
                  <td className="px-4 py-2">{column.is_nullable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
