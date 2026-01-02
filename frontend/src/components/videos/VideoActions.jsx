import React, { useState, useEffect, useRef } from 'react';
import { HiShare, HiDownload, HiOutlineCheck } from 'react-icons/hi';
import { FiCopy } from 'react-icons/fi';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import SuccessDialog from '../SuccessDialog';

const VideoActions = ({ video, onQualityChange, onSubtitleChange, currentQuality = 'auto', currentSubtitle = 'none' }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef(null);
  const qualityMenuRef = useRef(null);
  const subtitleMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target)) {
        setShowQualityMenu(false);
      }
      if (subtitleMenuRef.current && !subtitleMenuRef.current.contains(event.target)) {
        setShowSubtitleMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!video) return null;

  const videoId = video.id || video._id;
  const videoUrl = `${window.location.origin}/videos/${videoId}`;
  const shareTitle = video.title || 'Check out this video!';
  const shareDescription = video.description || '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowShareMenu(false);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = videoUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowShareMenu(false);
    }
  };

  const handleDownload = async () => {
    if (!video.videoFile && !video.url) {
      alert('Video URL not available for download');
      return;
    }

    try {
      const videoUrl = video.videoFile || video.url;
      
      // For Cloudinary URLs, we can add transformation for download quality
      // Or use the original URL
      const downloadUrl = videoUrl;
      
      // Fetch the video as a blob
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(video.title || 'video').replace(/[^a-z0-9]/gi, '_')}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      const videoUrl = video.videoFile || video.url;
      window.open(videoUrl, '_blank');
    }
  };

  const qualities = [
    { label: 'Auto', value: 'auto' },
    { label: '1080p', value: '1080p' },
    { label: '720p', value: '720p' },
    { label: '480p', value: '480p' },
    { label: '360p', value: '360p' },
  ];

  const subtitles = [
    { label: 'None', value: 'none' },
    { label: 'English', value: 'en' },
  ];

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Share Button */}
      <div className="relative" ref={shareMenuRef}>
        <button
          onClick={() => {
            setShowShareMenu(!showShareMenu);
            setShowQualityMenu(false);
            setShowSubtitleMenu(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <HiShare className="text-xl" />
          <span className="hidden md:inline">Share</span>
        </button>

        {showShareMenu && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition-colors text-left"
              >
                <FiCopy />
                <span>Copy Link</span>
              </button>
              
              <div className="border-t my-2"></div>
              
              <div className="flex gap-3 justify-center">
                <FacebookShareButton
                  url={videoUrl}
                  quote={shareTitle}
                  className="hover:opacity-80 transition-opacity"
                >
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                
                <TwitterShareButton
                  url={videoUrl}
                  title={shareTitle}
                  className="hover:opacity-80 transition-opacity"
                >
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                
                <WhatsappShareButton
                  url={videoUrl}
                  title={shareTitle}
                  className="hover:opacity-80 transition-opacity"
                >
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <HiDownload className="text-xl" />
        <span className="hidden md:inline">Download</span>
      </button>

      {/* Quality Selector */}
      <div className="relative" ref={qualityMenuRef}>
        <button
          onClick={() => {
            setShowQualityMenu(!showQualityMenu);
            setShowSubtitleMenu(false);
            setShowShareMenu(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <span className="hidden md:inline">Quality:</span>
          <span>{qualities.find(q => q.value === currentQuality)?.label || 'Auto'}</span>
        </button>

        {showQualityMenu && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-2 z-50 min-w-[150px]">
            {qualities.map((quality) => (
              <button
                key={quality.value}
                onClick={() => {
                  if (onQualityChange) {
                    onQualityChange(quality.value);
                  }
                  setShowQualityMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded transition-colors text-left"
              >
                <span>{quality.label}</span>
                {currentQuality === quality.value && (
                  <HiOutlineCheck className="text-green-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subtitle Selector */}
      <div className="relative" ref={subtitleMenuRef}>
        <button
          onClick={() => {
            setShowSubtitleMenu(!showSubtitleMenu);
            setShowQualityMenu(false);
            setShowShareMenu(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <span className="hidden md:inline">Subtitles:</span>
          <span>{subtitles.find(s => s.value === currentSubtitle)?.label || 'None'}</span>
        </button>

        {showSubtitleMenu && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-2 z-50 min-w-[150px]">
            {subtitles.map((subtitle) => (
              <button
                key={subtitle.value}
                onClick={() => {
                  if (onSubtitleChange) {
                    onSubtitleChange(subtitle.value);
                  }
                  setShowSubtitleMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded transition-colors text-left"
              >
                <span>{subtitle.label}</span>
                {currentSubtitle === subtitle.value && (
                  <HiOutlineCheck className="text-green-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {copySuccess && <SuccessDialog message="Link copied to clipboard!" />}
    </div>
  );
};

export default VideoActions;

