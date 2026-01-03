import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import VideoPlayer from '../components/videos/VideoPlayer';
import VideoDetails from '../components/videos/VideoDetails';
import VideoActions from '../components/videos/VideoActions';
import RelatedVideos from '../components/videos/RelatedVideos';
import Comments from '../components/videos/Comments';
import Spinner from '../components/Spinner';

const SinglepageVideo = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [quality, setQuality] = useState('auto');
  const [subtitle, setSubtitle] = useState('none');
  const [playerInstance, setPlayerInstance] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [parentCommentsCount, setParentCommentsCount] = useState(0);

  const { id } = useParams();

  useEffect(() => {
    const fetchVideoById = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/videos/${id}`);
        setVideo(response.data.data);

        const relatedResponse = await axiosInstance.get(`/videos/related/${id}`);
        setRelatedVideos(relatedResponse.data.data);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Fetch Error:', err.message || 'Something went wrong');
        setError(err.message || 'Something went wrong');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoById();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <Spinner loading={loading} />
      </div>
    );
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Video Content - Left Side (Wider) */}
        <div className="flex-1 min-w-0">
          {/* Video Player */}
          {video && (
            <div className="mb-4">
              <VideoPlayer video={video} quality={quality} subtitle={subtitle} onPlayerReady={setPlayerInstance} />
            </div>
          )}
          
          {/* Video Actions (Speed, Quality, etc.) */}
          {video && (
            <div className="mb-4">
              <VideoActions 
                video={video} 
                playerInstance={playerInstance} 
                onQualityChange={setQuality} 
                onSubtitleChange={setSubtitle} 
                currentQuality={quality} 
                currentSubtitle={subtitle} 
              />
            </div>
          )}
          
          {/* Video Details */}
          {video && (
            <div className="mb-6">
              <VideoDetails 
                video={video} 
                showComments={showComments}
                onToggleComments={() => setShowComments(!showComments)}
                commentsCount={commentsCount}
                parentCommentsCount={parentCommentsCount}
              />
            </div>
          )}
          
          {/* Comments Section - Only show when button is clicked */}
          {showComments && (
            <div className="mt-6">
              <Comments onCommentsChange={(totalCount, parentCount) => {
                setCommentsCount(totalCount);
                setParentCommentsCount(parentCount);
              }} />
            </div>
          )}
        </div>

        {/* Related Videos Sidebar - Right Side (Narrower) */}
        <div className="lg:w-96 flex-shrink-0">
          {relatedVideos.length > 0 && <RelatedVideos videos={relatedVideos} />}
        </div>
      </div>
    </div>
  );
};

export default SinglepageVideo;
