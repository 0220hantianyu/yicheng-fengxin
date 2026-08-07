import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { GeoSearchResult, GeoLocation } from '../../../shared/types';

interface CitySearchProps {
  initialCity?: string;
  initialDistrict?: string;
  onConfirm: (location: GeoLocation) => void;
}

export function CitySearch({ initialCity, initialDistrict, onConfirm }: CitySearchProps) {
  const [query, setQuery] = useState(initialCity || '');
  const [results, setResults] = useState<GeoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<GeoSearchResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialCity) {
      handleSearch(initialCity);
    }
  }, []);

  const handleSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchLocation(q.trim());
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 400);
  };

  const handleSelect = (result: GeoSearchResult) => {
    setSelected(result);
    setQuery(result.name);
    setResults([]);
    const displayName = [result.adm2, result.name].filter((v, i, arr) =>
      i === 0 || v !== arr[0]
    ).join('·');

    onConfirm({
      displayName: displayName || result.name,
      locationId: result.id,
      lat: result.lat,
      lon: result.lon,
      adm1: result.adm1,
      adm2: result.adm2,
      country: result.country,
    });
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="搜索城市或区县，如：北京、丽江、三亚"
          className="input-base pl-9"
          autoComplete="off"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dawn-400 animate-spin" />
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-white rounded-paper shadow-paper-hover border border-paper-200 max-h-56 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2.5 hover:bg-paper-50 border-b border-paper-100 last:border-0 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-dawn-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium text-gray-800">{r.name}</span>
                  <span className="text-xs text-gray-400 ml-1.5">
                    {r.adm1} {r.adm2 !== r.name ? r.adm2 : ''}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-pine-600">
          <MapPin size={12} />
          <span>已确认：{selected.adm1} {selected.name}</span>
        </div>
      )}
    </div>
  );
}
