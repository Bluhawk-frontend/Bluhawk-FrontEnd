import React, { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import { FaBell,FaTrash } from "react-icons/fa";
import { FiMessageSquare, FiAlertCircle, FiClipboard } from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NotificationDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [allNotificationsLoaded, setAllNotificationsLoaded] = useState(false);
  const bellRef = useRef(null);

  const handleClickOutside = (event) => {
    if (bellRef.current && !bellRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  const fetchNotifications = async (fetchAll = true) => { // Default to fetch all
    const token = Cookies.get("access_token");
    console.log("Fetched Token:", token);
    console.log("Fetching notifications, fetchAll:", fetchAll);

    if (!token) {
      console.warn("No access token found!");
      return;
    }

    try {
      let allNotifications = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await axios.get(`${API_BASE_URL}/auth/notifications/?offset=${offset}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        console.log(`Notifications response (offset=${offset}):`, response.data);
        console.log(`Total notifications fetched (offset=${offset}):`, response.data.notifications.length);
        const newNotifications = response.data.notifications || [];
        allNotifications = [...allNotifications, ...newNotifications];
        hasMore = newNotifications.length === 5; // Continue if full batch returned
        offset += 5;
      }
      setNotifications(allNotifications);
      setAllNotificationsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    }
  };

  const fetchUnseenStatus = async () => {
    const token = Cookies.get("access_token");
    const csrfToken = Cookies.get("csrftoken");

    if (!token) {
      console.warn("No access token found!");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/notifications/unseen-status/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      });
      console.log("Unseen status response:", response.data);
      const { unseen, unseen_count } = response.data;
      setHasUnseen(unseen === "true" || unseen_count > 0);
      setUnseenCount(unseen_count || 0);
    } catch (error) {
      console.error("Failed to fetch unseen status:", error);
      setHasUnseen(false);
      setUnseenCount(0);
    }
  };

  const handleClearAllNotifications = async () => {
    const csrfToken = Cookies.get("csrftoken");
    const token = Cookies.get("access_token");
    try {
      await axios.delete(`${API_BASE_URL}/auth/notifications/?clear_all=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      });
      setNotifications([]);
      fetchNotifications();
      setHasUnseen(false);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    const csrfToken = Cookies.get("csrftoken");
    const token = Cookies.get("access_token");
    try {
      await axios.delete(`${API_BASE_URL}/auth/notifications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
        data: { id },
      });
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      fetchNotifications();
      fetchUnseenStatus();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleAcceptInvitation = async (notification) => {
    const csrfToken = Cookies.get("csrftoken");
    try {
      await axios.post(
        `${API_BASE_URL}/auth/organization/verify-invitation`,
        {
          token: notification.json_data.verification_code,
          action: "accept",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      fetchNotifications();
      fetchUnseenStatus();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
  };

  const handleRejectInvitation = async (notification) => {
    const csrfToken = Cookies.get("csrftoken");
    try {
      await axios.post(
        `${API_BASE_URL}/auth/organization/verify-invitation`,
        {
          token: notification.json_data.verification_code,
          action: "reject",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      fetchNotifications();
      fetchUnseenStatus();
    } catch (error) {
      console.error("Failed to reject invitation:", error);
    }
  };
  const handleMarkAllAsRead = async () => {
    const csrfToken = Cookies.get("csrftoken");
    const token = Cookies.get("access_token");
    try {
      await axios.post(
        `${API_BASE_URL}/auth/notifications/mark-all-as-read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      fetchNotifications(); // Refresh notifications
      fetchUnseenStatus(); // Update unseen status
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown((prev) => !prev);
    fetchNotifications(); // Fetch all notifications on open
  };
const formatTimeAgo = (createdAt) => {
  const now = new Date();
  const notificationTime = new Date(createdAt);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);

  if (diffInSeconds < 60) {
    return diffInSeconds <= 1 ? "just now" : `${diffInSeconds} secs ago`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? "1 min ago" : `${diffInMinutes} mins ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  }
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  }
  const diffInYears = Math.floor(diffInMonths / 12);
  return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
};

  useEffect(() => {
    fetchUnseenStatus();
    const interval = setInterval(fetchUnseenStatus, 10000);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
  const interval = setInterval(() => {
    setNotifications((prev) => [...prev]); // Trigger re-render to update timestamps
  }, 1000); // Update every second
  return () => clearInterval(interval);
}, []);

  return (
    <div ref={bellRef} className="relative">
      <button
        onClick={handleBellClick}
        className="text-white focus:outline-none relative"
      >
        <FaBell size={24} className="mt-[9px]" />
        {hasUnseen && unseenCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unseenCount > 10 ? "10+" : unseenCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 left-0.5-translate-x-1/2 mt-2 bg-white rounded-md shadow-lg  pb-0 pt-0 w-70 max-w-[calc(100vw-20px)] sm:max-w-none z-50 max-h-[500px] overflow-y-auto  sm:right-0 sm:w-72 md:right-0 md:w-72">
          <div className="sticky top-0 flex justify-between bg-gray-100 rounded-md p-2 items-center mb-2">
            <span className="text-sm text-black">
              <b>Notifications</b>{" "}
              <span
                className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ml-1 ${
                  hasUnseen ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                <b>{notifications.length}</b>
              </span>
            </span>
            <button
              onClick={handleClearAllNotifications}
              className="bg-transparent text-red-500 px-1 py-1 rounded border border-red-500 hover:bg-red-500 hover:text-white text-xs"
            >
              Clear All
            </button>
            
          </div>
            {/* <hr className="sticky border-t bg-gray-100  border-gray-300 my-2"/>
           */}
          {notifications.length > 0 ? (
            <>
              {notifications.map((notif, index) => (
                <div
                  key={notif.id}
                  className="text-xs text-gray-700 p-2 bg-white rounded-md mb-1"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="flex text-gray-500 text-xs">
  <strong className="text-black">Invitation Accept</strong>
  <span className="ml-auto">{formatTimeAgo(notif.created_at)}</span>
</p>
                      <p>{notif.message}</p>
                     
                      {notif.type === "invitation" && notif.action_status === "pending" && (
                        <>
                          <p>Status: {notif.action_status}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAcceptInvitation(notif)}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectInvitation(notif)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        </>
                      )}
                      {notif.type === "invitation" && notif.action_status !== "pending" && (
                        <p>Status: {notif.action_status}</p>
                      )}
                      {notif.type === "invitation status" && notif.json_data.status && (
                        <p>Status: {notif.json_data.status}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-center h-full pt-12">
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <FaTrash size={14} />
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-sm text-gray-500 p-2 bg-white rounded-md mb-1">
              No notifications found
            </div>
          )}
          <div className="sticky bottom-0 p-3 bg-gray-100 rounded-md w-full">
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs sticky bottom-0 text-black bg-white border border-gray-700 px-2 py-1 rounded  text-left"
            >
              <svg
      className="inline mr-1"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" /> {/* First tick, matching the original */}
      <path d="M20 6L9 17l-5-5" transform="translate(-6, 0)" /> {/* Second tick, shifted left */}
    </svg>
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;