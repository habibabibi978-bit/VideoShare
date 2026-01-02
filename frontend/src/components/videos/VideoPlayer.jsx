import React, { useEffect, useRef, useState } from "react";
import cloudinary from 'cloudinary-video-player';
import "cloudinary-video-player/cld-video-player.min.css";

const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  try {
    return url.split('/').slice(7).join('/').slice(0, -4);
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

const VideoPlayer = ({ video, quality = 'auto', subtitle = 'none', ...props }) => {
  const [playerInstance, setPlayerInstance] = useState(null);

  if (!video) {
    return <div className="flex justify-center items-center bg-black p-8 text-white">Video not found</div>;
  }

  const { videoFile, url, thumbnail, owner } = video;
  // Use videoFile if available, otherwise fall back to url
  const videoUrl = videoFile || url;
  
  if (!videoUrl) {
    return <div className="flex justify-center items-center bg-black p-8 text-white">Video URL not available</div>;
  }

  if (!owner) {
    return <div className="flex justify-center items-center bg-black p-8 text-white">Video owner information not available</div>;
  }

  const { avatar, username } = owner;

  const thumbnailPublicId = thumbnail ? extractPublicId(thumbnail) : null;
  const publicId = extractPublicId(videoUrl);
  
  if (!publicId) {
    return <div className="flex justify-center items-center bg-black p-8 text-white">Invalid video URL format</div>;
  }

  const profileURL = `https://vidshare-now.vercel.app/c/${username}`;

  const cloudinaryRef = useRef(null);
  const playerRef = useRef(null);
  
  useEffect(() => {
    if (cloudinaryRef.current || !publicId) return;

    const cloudName = import.meta.env.VITE_REACT_APP_CLOUD_NAME;
    if (!cloudName) {
      console.error('Cloudinary cloud name not configured');
      return;
    }

    cloudinaryRef.current = cloudinary;
    
    // Cloudinary quality transformations
    const getQualityTransformation = (quality) => {
      if (quality === 'auto') return {};
      
      const qualityMap = {
        '1080p': { width: 1920, height: 1080, quality: 'auto' },
        '720p': { width: 1280, height: 720, quality: 'auto' },
        '480p': { width: 854, height: 480, quality: 'auto' },
        '360p': { width: 640, height: 360, quality: 'auto' },
      };
      
      return qualityMap[quality] || {};
    };

    const playerConfig = {
      cloud_name: cloudName,
      secure: true,
      controls: true,
      autoplay: true,
      autoplayMode: 'on-scroll',
      logoOnclickUrl: profileURL,
      transformation: getQualityTransformation(quality),
      // Enable quality selection
      sourceTypes: ['hls', 'mp4'],
      // Enable subtitle support (placeholder - can be extended with actual subtitle files)
      textTracks: subtitle !== 'none' ? [
        {
          kind: 'subtitles',
          src: subtitle === 'en' ? null : null, // Placeholder for future subtitle file upload
          srclang: subtitle === 'en' ? 'en' : null,
          label: subtitle === 'en' ? 'English' : null,
          default: subtitle === 'en',
        }
      ] : [],
    };

    if (thumbnailPublicId) {
      playerConfig.posterOptions = { publicId: thumbnailPublicId, effect: ['sepia'] };
    }

    if (avatar) {
      playerConfig.logoImageUrl = avatar;
    }

    const player = cloudinaryRef.current.videoPlayer(playerRef.current, playerConfig);
    player.source(publicId);
    setPlayerInstance(player);

    return () => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [publicId, thumbnailPublicId, profileURL, avatar]);

  // Update quality when changed
  useEffect(() => {
    if (playerInstance && publicId) {
      try {
        const getQualityTransformation = (quality) => {
          if (quality === 'auto') return {};
          
          const qualityMap = {
            '1080p': { width: 1920, height: 1080, quality: 'auto' },
            '720p': { width: 1280, height: 720, quality: 'auto' },
            '480p': { width: 854, height: 480, quality: 'auto' },
            '360p': { width: 640, height: 360, quality: 'auto' },
          };
          
          return qualityMap[quality] || {};
        };

        const transformation = getQualityTransformation(quality);
        playerInstance.source(publicId, {
          transformation: transformation
        });
      } catch (error) {
        console.error('Error changing quality:', error);
      }
    }
  }, [quality, playerInstance, publicId]);


  return (
    <div className="flex justify-center items-center bg-black max-h-500px overflow-hidden">

    <video
      ref={playerRef}
      className="cld-video-player cld-fluid w-auto h-auto max-h-full max-w-full"
      {...props}
    />
</div>
  )
};

export default VideoPlayer;
