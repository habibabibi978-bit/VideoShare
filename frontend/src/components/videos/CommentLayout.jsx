import React, { useState, useEffect, useRef } from 'react';
import { BiLike, BiDislike } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
import moment from 'moment';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';
import Avatar from '../Avatar'

function CommentLayout({ comment, setComments, videoId, isReply = false }) {
  const user = useSelector(state => state.user.user);

  const [isToggled, setIsToggled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [dislikesCount, setDislikesCount] = useState(comment.dislikesCount || 0);
  const [userLikeStatus, setUserLikeStatus] = useState(comment.userLikeStatus || null);
  const [replies, setReplies] = useState(comment.replies || []);
  const toggleRef = useRef();

  const isOwner = user?._id === comment?.owner?._id || user?.id === comment?.owner?.id;

  // Sync state when comment prop changes
  useEffect(() => {
    setLikesCount(comment.likesCount || 0);
    setDislikesCount(comment.dislikesCount || 0);
    setUserLikeStatus(comment.userLikeStatus || null);
    setReplies(comment.replies || []);
    // Ensure content is always set from comment prop
    if (comment.content !== undefined && comment.content !== null) {
      setContent(comment.content);
    }
  }, [comment]);

  // to close the dropdown when clicked outside the component or dropdown itself is clicked again to close it 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toggleRef.current && !toggleRef.current.contains(event.target)) {
        setIsToggled(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUpdateComment = async () => {
    try {
      await axiosInstance.put(`/comments/${comment.id || comment._id}`, { content });
      const updatedComment = {
        ...comment,
        content,
      };
      setComments(prevComments => prevComments.map(c => ((c.id || c._id) === (comment.id || comment._id) ? updatedComment : c)));
      setIsEditing(false);
      setIsToggled(false);
    } catch (error) {
      console.error('Update Comment Error:', error.message || 'Something went wrong');
    }
  };

  const handleDeleteComment = async () => {
    try {
      await axiosInstance.delete(`/comments/${comment.id || comment._id}`);
      setComments(prevComments => prevComments.filter(c => (c.id || c._id) !== (comment.id || comment._id)));
      setIsToggled(false);
    } catch (error) {
      console.error('Delete Comment Error:', error.message || 'Something went wrong');
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to like comments');
      return;
    }
    
    const commentId = comment.id || comment._id;
    if (!commentId) {
      console.error('Comment ID is missing');
      return;
    }

    try {
      const response = await axiosInstance.post(`/comments/toggle-comment-like/${commentId}`);
      const data = response.data?.data || response.data;
      
      // Update both counts from backend response
      if (data.likesCount !== undefined) {
        setLikesCount(data.likesCount);
      }
      if (data.dislikesCount !== undefined) {
        setDislikesCount(data.dislikesCount);
      }
      
      if (data.liked !== undefined) {
        setUserLikeStatus(data.liked ? 'like' : null);
      }
      
      // Update the comment in the parent list
      setComments(prevComments => 
        prevComments.map(c => {
          const cId = c.id || c._id;
          if (cId === commentId) {
            return {
              ...c,
              likesCount: data.likesCount !== undefined ? data.likesCount : c.likesCount,
              dislikesCount: data.dislikesCount !== undefined ? data.dislikesCount : c.dislikesCount,
              userLikeStatus: data.liked !== undefined ? (data.liked ? 'like' : null) : c.userLikeStatus,
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Like Comment Error:', error.response?.data || error.message || 'Something went wrong');
      alert(error.response?.data?.message || 'Failed to like comment. Please try again.');
    }
  };

  const handleDislike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to dislike comments');
      return;
    }
    
    const commentId = comment.id || comment._id;
    if (!commentId) {
      console.error('Comment ID is missing');
      return;
    }

    try {
      const response = await axiosInstance.post(`/comments/toggle-comment-dislike/${commentId}`);
      const data = response.data?.data || response.data;
      
      // Update both counts from backend response
      if (data.dislikesCount !== undefined) {
        setDislikesCount(data.dislikesCount);
      }
      if (data.likesCount !== undefined) {
        setLikesCount(data.likesCount);
      }
      
      if (data.disliked !== undefined) {
        setUserLikeStatus(data.disliked ? 'dislike' : null);
      }
      
      // Update the comment in the parent list
      setComments(prevComments => 
        prevComments.map(c => {
          const cId = c.id || c._id;
          if (cId === commentId) {
            return {
              ...c,
              dislikesCount: data.dislikesCount !== undefined ? data.dislikesCount : c.dislikesCount,
              likesCount: data.likesCount !== undefined ? data.likesCount : c.likesCount,
              userLikeStatus: data.disliked !== undefined ? (data.disliked ? 'dislike' : null) : c.userLikeStatus,
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Dislike Comment Error:', error.response?.data || error.message || 'Something went wrong');
      alert(error.response?.data?.message || 'Failed to dislike comment. Please try again.');
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    const content = replyContent.trim();
    if (!content || !user) return;
    if (!videoId) {
      console.error('Video ID is missing');
      return;
    }
    const parentId = comment.id || comment._id;
    if (!parentId) {
      console.error('Parent comment ID is missing');
      return;
    }
    try {
      const response = await axiosInstance.post(`/comments/video/${videoId}`, {
        content,
        parentId,
      });
      const newReply = {
        ...response.data.data,
        owner: user,
      };
      setReplies([...replies, newReply]);
      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      console.error('Add Reply Error:', error.response?.data || error.message || 'Something went wrong');
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to add reply. Please try again.');
    }
  };

  const commentId = comment.id || comment._id;

  return (
    <li className={`flex items-start justify-between bg-white shadow-lg rounded-lg p-4 mb-4 border border-gray-200 ${isReply ? 'ml-8' : ''}`}>
      <div className="flex items-start space-x-4 flex-1">
        <Avatar user={comment.owner} type='medium' />
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-800">@{comment.owner?.username}
            <span className="ml-1 text-gray-500 text-xs">{moment(comment.createdAt).fromNow()}</span>
          </p>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handleUpdateComment}
                className="bg-blue-500 text-white p-1 rounded-lg my-2"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-red-500 text-white p-1 rounded-lg ml-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-gray-600 whitespace-pre-wrap">{comment.content || content || ''}</p>
          )}
          <div className="flex items-center space-x-4 mt-2">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${userLikeStatus === 'like' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500 transition-colors cursor-pointer`}
              disabled={!user}
              title={user ? 'Like this comment' : 'Login to like'}
            >
              <BiLike className={`text-xl ${userLikeStatus === 'like' ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
            <button
              type="button"
              onClick={handleDislike}
              className={`flex items-center space-x-1 ${userLikeStatus === 'dislike' ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors cursor-pointer`}
              disabled={!user}
              title={user ? 'Dislike this comment' : 'Login to dislike'}
            >
              <BiDislike className={`text-xl ${userLikeStatus === 'dislike' ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{dislikesCount}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-sm text-gray-500 hover:text-blue-500 transition-colors"
                disabled={!user}
              >
                Reply
              </button>
            )}
            {!isReply && replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-sm text-gray-500 hover:text-blue-500 transition-colors"
              >
                {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
          {isReplying && !isReply && (
            <form onSubmit={handleAddReply} className="mt-3 flex items-center space-x-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Add a reply..."
                className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </form>
          )}
          {showReplies && !isReply && replies.length > 0 && (
            <ul className="mt-4 space-y-2">
              {replies.map((reply) => {
                const replyId = reply.id || reply._id;
                return (
                  <CommentLayout
                    key={`reply-${replyId}`}
                    comment={reply}
                    setComments={(updater) => {
                      // Update replies when a reply is modified
                      if (typeof updater === 'function') {
                        setReplies(prevReplies => updater(prevReplies));
                      } else {
                        setReplies(updater);
                      }
                      // Also update parent comments list
                      setComments(prevComments => 
                        prevComments.map(c => {
                          const cId = c.id || c._id;
                          const commentId = comment.id || comment._id;
                          if (cId === commentId) {
                            return {
                              ...c,
                              replies: typeof updater === 'function' ? updater(c.replies || []) : updater,
                            };
                          }
                          return c;
                        })
                      );
                    }}
                    videoId={videoId}
                    isReply={true}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </div>
      {isOwner && (
        <div className="relative" ref={toggleRef}>
          <button onClick={() => setIsToggled(!isToggled)} className="focus:outline-none hover:bg-gray-200 rounded-full p-2">
            <FiMoreVertical className="text-xl text-gray-500" />
          </button>
          {isToggled && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={() => setIsEditing(true)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Update
              </button>
              <button
                onClick={handleDeleteComment}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default CommentLayout;
