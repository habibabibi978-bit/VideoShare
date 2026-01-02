import React, { useState, useRef } from 'react';
import { FaPlay } from 'react-icons/fa';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs > 0 ? `${hrs}:` : ''}${hrs > 0 && mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
}

// Extract public ID from Cloudinary URL for transformations
function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    return parts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, '');
  } catch (error) {
    return null;
  }
}

// Generate optimized thumbnail URL from Cloudinary
function getThumbnailUrl(thumbnail, videoFile) {
  if (thumbnail) return thumbnail;
  
  // If no thumbnail, try to generate one from video URL
  if (videoFile) {
    const publicId = extractPublicId(videoFile);
    if (publicId) {
      // Extract cloud name from URL
      const urlParts = videoFile.split('/');
      const cloudNameIndex = urlParts.findIndex(part => part.includes('cloudinary.com'));
      if (cloudNameIndex !== -1) {
        const cloudName = urlParts[cloudNameIndex - 1] || urlParts[cloudNameIndex].split('.')[0];
        return `https://res.cloudinary.com/${cloudName}/video/upload/so_0/${publicId}.jpg`;
      }
    }
  }
  return null;
}

function VideoThumbnail({ video }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef(null);

  const thumbnail = video?.thumbnail;
  const videoFile = video?.videoFile || video?.url;
  const thumbnailUrl = getThumbnailUrl(thumbnail, videoFile);
  const duration = video?.duration || 0;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoFile) {
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div 
      className="relative w-full rounded-lg overflow-hidden bg-gray-900 group cursor-pointer"
      style={{ paddingBottom: '56.25%' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail Image */}
      {!isHovered && thumbnailUrl && !imageError && (
        <img
          src={thumbnailUrl}
          alt={video?.title || 'Video thumbnail'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      )}

      {/* Fallback placeholder */}
      {(!thumbnailUrl || imageError) && !isHovered && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <FaPlay className="mx-auto text-white text-4xl opacity-50 mb-2" />
            <p className="text-white text-sm opacity-50">{video?.title || 'Video'}</p>
          </div>
        </div>
      )}

      {/* Video Preview on Hover */}
      {isHovered && videoFile && (
        <video
          ref={videoRef}
          src={videoFile}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
        <div className="w-16 h-16 rounded-full bg-red-600 bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FaPlay className="text-white text-xl ml-1" />
        </div>
      </div>

      {/* Duration Badge */}
      {duration > 0 && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded font-semibold">
          {formatDuration(duration)}
        </div>
      )}
    </div>
  );
}

export default VideoThumbnail;
