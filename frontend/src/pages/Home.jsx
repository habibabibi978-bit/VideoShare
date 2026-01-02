// components/Home.js
import React, { useEffect } from 'react';
import VideoCard from '../components/videos/VideoCard';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '../components/Spinner';
import ErrorDialog from '../components/ErrorDialog';
import { fetchAllVideos } from '../features/videosSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { videos, loading, error } = useSelector((state) => state.videos);
  const user = useSelector((state) => state.user.user);
  const isMenuOpen = useSelector((state) => state.menu.isMenuOpen);

  useEffect(() => {
    dispatch(fetchAllVideos());
  }, [dispatch]);

  const homeVideos = Array.isArray(videos) ? videos.filter(video => video.owner?.id !== user?.id) : [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {homeVideos.map((video) => (
          <VideoCard key={video.id || video._id} video={video} />
        ))}
      </div>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Spinner loading={loading} />
        </div>
      )}
      {!homeVideos.length && !loading && (
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">No Videos Found!</p>
            <p className="text-gray-500 dark:text-gray-500">Check back later for new content.</p>
          </div>
        </div>
      )}
      {error && <ErrorDialog message={error.message} />}
    </div>
  );
};

export default Home;
