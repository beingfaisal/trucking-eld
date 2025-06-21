import PropTypes from 'prop-types';
import routeIcon from '../static/route.png';

function Banner({
  title   = 'Trucking ELD',
  tagline = 'Effortless Route Planning',
  logoSrc = routeIcon,
}) {
  return (
    <header className="bg-transparent border-b border-gray-300 backdrop-filter backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-center px-6 py-4">
        <img
          src={logoSrc}
          alt="Route Logo"
          className="h-10 w-auto"
        />
        <div className="flex items-baseline ml-4 space-x-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {title}
          </h1>
          {tagline && (
            <p className="text-gray-700 italic text-sm sm:text-base">
              {tagline}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

Banner.propTypes = {
  title:   PropTypes.string,
  tagline: PropTypes.string,
  logoSrc: PropTypes.string,
};

export default Banner;
