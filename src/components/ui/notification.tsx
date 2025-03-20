/**
 * Notification System Component
 * 
 * This file implements a complete notification system for the application,
 * allowing for displaying various types of notifications (success, error, info, warning)
 * with automatic dismissal and visual styling based on notification type.
 * 
 * The system uses React Context to provide notification functionality throughout the app
 * without prop drilling, and includes animations for a polished user experience.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Available notification types
 * Each type has its own icon and color scheme
 */
type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Notification properties interface
 * @property {string} id - Unique identifier for the notification
 * @property {string} title - Title displayed at the top of the notification
 * @property {string} message - Main content of the notification
 * @property {NotificationType} type - Type of notification (affects styling and icon)
 * @property {number} [duration] - Time in milliseconds before auto-dismissal (default: 60000ms/1min)
 */
export interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number; // Duration in milliseconds, default is 60000 (1 minute)
}

/**
 * Notification context interface
 * Defines the shape of the notification context object
 * @property {NotificationProps[]} notifications - Array of active notifications
 * @property {Function} showNotification - Function to display a new notification
 * @property {Function} dismissNotification - Function to remove a notification by ID
 */
interface NotificationContextType {
  notifications: NotificationProps[];
  showNotification: (notification: Omit<NotificationProps, 'id'>) => string;
  dismissNotification: (id: string) => void;
}

// Create notification context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * NotificationProvider Component
 * 
 * Wraps the application to provide notification functionality
 * Manages the state of all active notifications and provides methods
 * to show and dismiss notifications throughout the app
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // State to track all active notifications
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  
  /**
   * Shows a new notification
   * Generates a unique ID and adds the notification to state
   * 
   * @param {Omit<NotificationProps, 'id'>} notification - Notification data without ID
   * @returns {string} The generated notification ID (useful for programmatic dismissal)
   */
  const showNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
    return id;
  };
  
  /**
   * Dismisses a notification by ID
   * Removes the notification from state
   * 
   * @param {string} id - ID of the notification to dismiss
   */
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };
  
  return (
    <NotificationContext.Provider value={{ notifications, showNotification, dismissNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

/**
 * useNotification Hook
 * 
 * Custom hook to access the notification context
 * Provides a convenient way to use notification functionality in any component
 * 
 * @returns {NotificationContextType} Notification context with show/dismiss methods
 * @throws {Error} If used outside of a NotificationProvider
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}

/**
 * Notification Component
 * 
 * Renders a single notification with appropriate styling and behavior
 * Includes auto-dismissal after the specified duration
 * 
 * @param {Object} props - Component props
 * @param {NotificationProps} props.notification - The notification data to display
 * @param {Function} props.onDismiss - Callback function to dismiss this notification
 */
function Notification({ notification, onDismiss }: { notification: NotificationProps; onDismiss: () => void }) {
  // Auto-dismiss notification after specified duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, notification.duration || 60000); // Default to 60000ms (1 minute)
    
    return () => clearTimeout(timer);
  }, [notification.duration, onDismiss]);
  
  /**
   * Gets the appropriate icon component based on notification type
   * @returns {JSX.Element} Icon component
   */
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };
  
  /**
   * Gets the appropriate color based on notification type
   * @returns {string} Hex color code
   */
  const getColor = () => {
    switch (notification.type) {
      case 'success':
        return '#16a34a';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return '#3b82f6';
    }
  };
  
  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        borderRadius: '0.375rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${getColor()}`,
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        animation: 'slide-in-right 0.3s ease-out forwards'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Notification icon */}
        <div style={{ 
          color: getColor(),
          marginRight: '0.75rem',
          marginTop: '0.25rem'
        }}>
          {getIcon()}
        </div>
        
        {/* Notification content */}
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: 0, 
            marginBottom: '0.25rem', 
            fontSize: '1rem', 
            fontWeight: 'bold',
            color: getColor()
          }}>
            {notification.title}
          </h4>
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem',
            opacity: 0.9
          }}>
            {notification.message}
          </p>
        </div>
        
        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0.25rem',
            marginLeft: '0.5rem',
            marginTop: '-0.25rem',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/**
 * NotificationContainer Component
 * 
 * Renders a container for all active notifications
 * Positions notifications in the top-right corner of the screen
 * Handles stacking and scrolling of multiple notifications
 */
function NotificationContainer() {
  const { notifications, dismissNotification } = useNotification();
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        maxHeight: '100vh',
        overflowY: 'auto',
        padding: '0.5rem',
        pointerEvents: 'none' // Allow clicking through the container
      }}
    >
      {notifications.map((notification) => (
        <div key={notification.id} style={{ pointerEvents: 'auto', width: '100%' }}>
          <Notification
            notification={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        </div>
      ))}
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes slide-in-right {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slide-out-right {
            0% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
