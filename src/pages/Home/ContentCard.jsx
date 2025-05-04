import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BiStar, BiCalendar } from 'react-icons/bi'; // Example icons

const ContentCard = ({ title, poster, rating, onClick, releaseDate, ariaLabel }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.warn(`Image failed to load: ${poster}`);
    setImageError(true);
  };

  // If the image failed to load, don't render the card
  if (imageError) {
    return null;
  }

  // Helper function to safely get the year
  const getYear = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return !isNaN(date.getFullYear()) ? date.getFullYear() : null;
  };

  const year = getYear(releaseDate);

  return (
    <div
      className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer group transition-all duration-300 ease-in-out" // Changed to flex column
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || title}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[2/3] overflow-hidden"> {/* Added overflow-hidden */}
        <img
          src={poster}
          alt={`Poster for ${title}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={handleImageError}
        />
         {/* Removed the hover overlay div */}
      </div>

      {/* Details Section - Always Visible Below Image */}
      <div className="p-2 md:p-3 flex-grow flex flex-col justify-between"> {/* Added padding and flex */}
        {/* Title */}
        <h3 className="text-white text-sm font-semibold line-clamp-2 mb-1 group-hover:text-cyan-400 transition-colors" title={title}> {/* Allow two lines for title */}
          {title}
        </h3>

        {/* Date and Rating */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
          {/* Release Year */}
          {year && (
             <span className="flex items-center">
               <BiCalendar className="mr-1" />
               {year}
             </span>
          )}
          {/* Rating */}
          {rating !== undefined && rating > 0 ? ( // Check if rating exists and is positive
            <span className="flex items-center">
              <BiStar className="text-yellow-400 mr-1" />
              {rating.toFixed(1)}
            </span>
          ) : (
             // Optional: Show something if rating is 0 or undefined
             <span className="flex items-center text-gray-500">
                <BiStar className="mr-1" />
                N/A
             </span>
          )}
        </div>
      </div>
    </div>
  );
};

ContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired,
  rating: PropTypes.number,
  onClick: PropTypes.func.isRequired,
  releaseDate: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default ContentCard;