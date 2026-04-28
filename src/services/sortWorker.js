/* eslint-disable no-restricted-globals */
self.onmessage = function(e) {
  try {
    const { movies, sortConfig } = e.data;
    if (!movies) {
      self.postMessage([]);
      return;
    }
    const { dimension, direction, value } = sortConfig;

    let sortedMovies = [...movies];

    // 1. Filtering (if value is provided for specific dimensions)
    if (value !== undefined && value !== null) {
      if (dimension === 'type') {
        // m.genres is a comma-separated string from backend
        sortedMovies = sortedMovies.filter(m => {
          if (!m.genres) return false;
          const movieGenres = m.genres.split(',').map(g => g.trim());
          return movieGenres.includes(value);
        });
      } else if (dimension === 'letter') {
        sortedMovies = sortedMovies.filter(m => m.title && m.title.charAt(0).toUpperCase() === value);
      } else if (dimension === 'region') {
        if (value === 'all') {
          // No filtering
        } else {
          sortedMovies = sortedMovies.filter(m => {
            const countryMap = {
              'the United States': { code: 'US', lang: 'en' },
              'China': { code: 'CN', lang: 'zh' },
              'Japan': { code: 'JP', lang: 'ja' },
              'Korea': { code: 'KR', lang: 'ko' },
              'Britain': { code: 'GB', lang: 'en' },
              'Europe': { code: ['FR', 'DE', 'IT', 'ES', 'GB', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI'], lang: ['fr', 'de', 'it', 'es', 'nl'] }
            };
            const target = countryMap[value];
            if (!target) return true;

            // 1. Check origin_country if exists
            if (m.origin_country) {
              if (Array.isArray(target.code)) {
                if (target.code.some(c => m.origin_country.includes(c))) return true;
              } else {
                if (m.origin_country.includes(target.code)) return true;
              }
            }

            // 2. Fallback to original_language
            if (m.original_language) {
              if (Array.isArray(target.lang)) {
                if (target.lang.includes(m.original_language)) return true;
              } else {
                if (m.original_language === target.lang) return true;
              }
            }

            return false;
          });
        }
      }
    }

    // 2. Sorting
    sortedMovies.sort((a, b) => {
      let comparison = 0;
      
      switch (dimension) {
        case 'year':
          const yearA = new Date(a.release_date).getFullYear() || 0;
          const yearB = new Date(b.release_date).getFullYear() || 0;
          comparison = yearA - yearB;
          break;
        case 'type':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'letter':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'region':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        default:
          // For popular, top_rated etc, we keep backend order or sort by popularity/vote
          if (dimension === 'top_rated') {
            comparison = (a.vote_average || 0) - (b.vote_average || 0);
          } else if (dimension === 'popular') {
            comparison = (a.popularity || 0) - (b.popularity || 0);
          } else {
            comparison = 0;
          }
      }

      return direction === 'desc' ? comparison * -1 : comparison;
    });

    self.postMessage(sortedMovies);
  } catch (error) {
    console.error('Worker error:', error);
    // If error, return original movies to avoid blank screen
    if (e.data && e.data.movies) {
      self.postMessage(e.data.movies);
    }
  }
};
