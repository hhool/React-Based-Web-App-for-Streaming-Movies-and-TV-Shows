import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Movie from './Movie/Movie';
import Series from './TV/Series';
import TopImdb from './TopImdb/TopImdb'; // Import the new component
import MovieDetails from './Movie/MovieDetails';
import TvDetails from './TV/TvDetails';
import { useMovie } from './useMovie';
import { useSeries } from './useSeries';
import { BiMovie, BiCameraMovie, BiStar, BiUpArrowAlt } from 'react-icons/bi'; // Added BiStar
import { SeriesProvider } from './SeriesContext';
import { MovieProvider } from './MoviesContext';
import Navbar from './Navbar';
import Loadingspinner from './resused/Loadingspinner';

// --- MainContent modifications ---
const MainContent = ({ activePage, isLoading }) => {
  const { selectedMovie, selectMovie } = useMovie();
  const { selectedSeries, selectSeries } = useSeries();

  const closeDetails = () => {
    selectMovie(null);
    selectSeries(null);
  };

  const showNavigation = !selectedMovie && !selectedSeries;

  return (
    <main
      className={`w-full transition-all duration-500 ${showNavigation ? 'pt-20' : 'pt-4'}`}
    >
      {showNavigation && (
        <div className="gap-12">
          {/* Render based on activePage prop */}
          {activePage === 'movies' && <Movie />}
          {activePage === 'series' && <Series />}
          {activePage === 'top_imdb' && <TopImdb />} {/* Render TopImdb */}
        </div>
      )}

      {(selectedMovie || selectedSeries) && (
        <div className="animate-fadeIn px-4 md:px-8 lg:px-16 py-8">
          <button
            onClick={closeDetails}
            className="mb-10 px-3 py-1.5 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-xl group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <svg
              className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium tracking-wide">Back</span>
          </button>
          {selectedMovie ? (
            <MovieDetails
              movieId={selectedMovie.id}
              closeDetails={closeDetails}
            />
          ) : (
            <TvDetails tvId={selectedSeries.id} closeDetails={closeDetails} />
          )}
        </div>
      )}
      {isLoading && !selectedMovie && !selectedSeries && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Loadingspinner />
        </div>
      )}
    </main>
  );
};

MainContent.propTypes = {
  activePage: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
// --- End MainContent ---


// --- ParentComponent modifications ---
function ParentComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('movies'); // Default state
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Effect to update activePage based on URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setIsLoading(true);
    let newPage = 'movies'; // Default
    if (queryParams.has('tv')) {
      newPage = 'series';
    } else if (queryParams.has('top_imdb')) { // Check for top_imdb
      newPage = 'top_imdb';
    }
    setActivePage(newPage);

    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.search]);

  const handleScroll = useCallback(() => {
    setScrollPosition(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update handleNavigation to change the URL
  const handleNavigation = (page) => {
    let targetQuery = '?movie'; // Default
    if (page === 'series') {
      targetQuery = '?tv';
    } else if (page === 'top_imdb') { // Handle top_imdb
      targetQuery = '?top_imdb';
    }

    if (location.search !== targetQuery) {
      navigate(targetQuery);
    }
  };

  const handlePageChange = (page) => {
     console.log("Navbar page change:", page);
  };

  return (
    <SeriesProvider>
      <MovieProvider>
        <AppContent
          activePage={activePage}
          scrollPosition={scrollPosition}
          isLoading={isLoading}
          handleNavigation={handleNavigation}
          handlePageChange={handlePageChange}
          scrollToTop={scrollToTop}
        />
      </MovieProvider>
    </SeriesProvider>
  );
}
// --- End ParentComponent modifications ---


// --- AppContent modifications ---
const AppContent = ({
  activePage,
  scrollPosition,
  isLoading,
  handleNavigation,
  handlePageChange,
  scrollToTop,
}) => {
  const { selectedMovie } = useMovie();
  const { selectedSeries } = useSeries();
  const showNavbar = !selectedMovie && !selectedSeries;

  return (
    <div className="min-h-screen relative text-white">
      {/* Navbar */}
      <nav
        className={`top-0 left-0 fixed w-full shadow-lg z-50 bg-black/90 ${!showNavbar ? 'hidden' : ''}`}
      >
        <Navbar
          onNavigate={handleNavigation}
          activePage={activePage}
          onPageChange={handlePageChange}
        />
      </nav>

      {/* Navigation Buttons */}
      {!selectedMovie && !selectedSeries && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40 flex gap-4">
          {/* Movies Button */}
          <button
            onClick={() => handleNavigation('movies')}
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 text-white rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl ${
              activePage === 'movies'
                ? 'bg-orange-600 shadow-orange-500/30'
                : 'bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm'
            }`}
          >
            <BiMovie className="text-xl sm:text-2xl" />
            Movies
          </button>
          {/* Series Button */}
          <button
            onClick={() => handleNavigation('series')}
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 text-white rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl ${
              activePage === 'series'
                ? 'bg-orange-600 shadow-orange-500/30'
                : 'bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm'
            }`}
          >
            <BiCameraMovie className="text-xl sm:text-2xl" />
            Series
          </button>
          {/* Top IMDb Button */}
          <button
            onClick={() => handleNavigation('top_imdb')}
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 text-white rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl ${
              activePage === 'top_imdb'
                ? 'bg-orange-600 shadow-orange-500/30'
                : 'bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm'
            }`}
          >
            <BiStar className="text-xl sm:text-2xl" /> {/* Added Icon */}
            Top
          </button>
        </div>
      )}

      {/* Floating Scroll Button */}
      {scrollPosition > 300 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 hover:bg-gradient-to-r from-red-6 to-pink-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
          aria-label="Scroll to Top"
        >
          <BiUpArrowAlt className="text-2xl" />
        </button>
      )}

      {/* Main Content */}
      <MainContent activePage={activePage} isLoading={isLoading} />
    </div>
  );
};

AppContent.propTypes = {
  activePage: PropTypes.string.isRequired,
  scrollPosition: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  handleNavigation: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  scrollToTop: PropTypes.func.isRequired,
};
// --- End AppContent ---

export default ParentComponent;