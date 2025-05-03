import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Loadingspinner from '../resused/Loadingspinner'; // Adjust path if needed
import { useMovie } from '../useMovie'; // Import context to handle movie selection
import { useSeries } from '../useSeries'; // Import context to handle series selection

const API_KEY = import.meta.env.VITE_TMDB_API; // *** IMPORTANT: Ensure this matches your .env file (VITE_TMDB_API_KEY) ***
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Poster size
const ITEMS_TO_SHOW = 50; // Show top 50

function TopTmdb() {
  const [topMovies, setTopMovies] = useState([]);
  const [topSeries, setTopSeries] = useState([]); // State for popular series
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectMovie } = useMovie();
  const { selectSeries } = useSeries(); // Get series selection function

  useEffect(() => {
    // Renamed function to reflect fetching both movies and series
    const fetchTopPopular = async () => {
      setIsLoading(true);
      setError(null);
      let allMovies = [];
      let allSeriesData = []; // Use a different variable name for series data

      try {
        // Determine pages needed (TMDb returns 20 per page)
        const pagesToFetch = Math.ceil(ITEMS_TO_SHOW / 20);
        const moviePromises = [];
        const seriesPromises = [];

        // Create fetch promises for movies and series for the required number of pages
        for (let page = 1; page <= pagesToFetch; page++) {
          // Movie fetch promise
          moviePromises.push(
            fetch(
              `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}&language=en-US&include_adult=false`
            ).then(response => {
              if (!response.ok) throw new Error(`Movie fetch failed: ${response.status}`);
              return response.json();
            })
          );

          // Series fetch promise
          seriesPromises.push(
            fetch(
              `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}&language=en-US` // Fetch popular TV series
            ).then(response => {
              if (!response.ok) throw new Error(`Series fetch failed: ${response.status}`);
              return response.json();
            })
          );
        }

        // Wait for all movie and series fetches to complete concurrently
        const [movieResponses, seriesResponses] = await Promise.all([
          Promise.all(moviePromises),
          Promise.all(seriesPromises)
        ]);

        // Combine results from all pages for movies
        movieResponses.forEach(data => {
          allMovies = [...allMovies, ...data.results];
        });

        // Combine results from all pages for series
        seriesResponses.forEach(data => {
          allSeriesData = [...allSeriesData, ...data.results];
        });

        // --- Add Duplicate Filtering ---
        const uniqueMovies = Array.from(new Map(allMovies.map(item => [item.id, item])).values());
        const uniqueSeries = Array.from(new Map(allSeriesData.map(item => [item.id, item])).values());
        // --- End Duplicate Filtering ---

        // Filter out items without poster_path *from unique lists*
        const filteredMovies = uniqueMovies.filter(item => item.poster_path);
        const filteredSeries = uniqueSeries.filter(item => item.poster_path);

        // Slice to get exactly the top ITEMS_TO_SHOW for both (from filtered unique lists)
        setTopMovies(filteredMovies.slice(0, ITEMS_TO_SHOW));
        setTopSeries(filteredSeries.slice(0, ITEMS_TO_SHOW));

      } catch (err) {
        console.error("Failed to fetch top popular content:", err);
        setError(err.message || 'Failed to load top popular content.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopPopular();
  }, []); // Empty dependency array means run once on mount

  const handleMovieClick = (movie) => {
    selectMovie(movie);
  };

  const handleSeriesClick = (series) => { // Handler for clicking series
    selectSeries(series);
  };

  // Reusable component for rendering a grid of items
  // No changes needed here as filtering is done before passing items
  const ItemGrid = ({ items, title, onItemClick, type }) => (
    <div className="mb-12">
      <h3 className="text-xl md:text-2xl font-semibold mb-4 border-l-4 border-cyan-500 pl-3">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {/* Map over the already filtered items */}
        {items.map((item) => (
          <div
            key={item.id} // Key should now be unique
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl group"
            onClick={() => onItemClick(item)}
          >
            <img
              // item.poster_path is guaranteed to exist here due to filtering
              src={`${IMAGE_BASE_URL}${item.poster_path}`}
              alt={type === 'movie' ? item.title : item.name} // Use name for series title
              className="w-full h-auto object-cover aspect-[2/3]"
              loading="lazy"
              // Optional: Add onError handler here too if you want redundancy or specific logging
              // onError={(e) => { e.target.style.display = 'none'; /* Hide img tag */ console.warn('Img load error in ItemGrid'); }}
            />
            <div className="p-3">
              <h4 className="text-sm font-semibold truncate group-hover:text-cyan-400 transition-colors" title={type === 'movie' ? item.title : item.name}>
                {type === 'movie' ? item.title : item.name} {/* Display correct title */}
              </h4>
              <p className="text-xs text-gray-400">
                Popularity: {item.popularity?.toFixed(0)}
              </p>
              <p className="text-xs text-gray-400">
                Rating: {item.vote_average?.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  ItemGrid.propTypes = {
    items: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    onItemClick: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loadingspinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="text-white p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        Top 50 Popular Movies & Series {/* Updated Title */}
      </h2>

      {/* Movies Section */}
      {topMovies.length > 0 && (
        // Removed extra <main> and <div> wrappers for cleaner structure
        <ItemGrid
          items={topMovies}
          title="Top 50 Popular Movies"
          onItemClick={handleMovieClick}
          type="movie" // Specify type
        />
      )}

      {/* Series Section */}
      {topSeries.length > 0 && (
        // Removed extra <main> and <div> wrappers
        <ItemGrid
          items={topSeries}
          title="Top 50 Popular TV Series"
          onItemClick={handleSeriesClick} // Use series handler
          type="series" // Specify type
        />
      )}

      {/* Handle case where nothing is found */}
      {topMovies.length === 0 && topSeries.length === 0 && !isLoading && (
         <p className="text-center text-gray-400 mt-8">No popular content found with posters.</p> // Updated message
      )}
    </div>
  );
}

export default TopTmdb;