import React, { useState, useEffect } from 'react';

export interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  title,
  message,
  type = 'info',
  duration = 60000, // 1 minute default
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Get color based on notification type
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return '#16a34a'; // Green
      case 'warning':
        return '#eab308'; // Yellow
      case 'error':
        return '#dc2626'; // Red
      case 'info':
      default:
        return '#3b82f6'; // Blue
    }
  };

  // Get icon based on notification type
  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  useEffect(() => {
    // Start countdown for auto-dismiss
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress <= 0) {
          clearInterval(interval);
          setIsVisible(false);
          if (onClose) onClose();
          return 0;
        }
        return prevProgress - (100 / (duration / 1000));
      });
    }, 1000);

    setIntervalId(interval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    if (intervalId) clearInterval(intervalId);
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        backgroundColor: '#2a2a2a',
        borderLeft: `4px solid ${getTypeColor()}`,
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        maxWidth: '28rem'
      }}
    >
      <div
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'flex-start'
        }}
      >
        <div
          style={{
            backgroundColor: getTypeColor(),
            color: 'white',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            height: '2rem',
            width: '2rem',
            marginRight: '0.75rem'
          }}
        >
          {getTypeIcon()}
        </div>
        <div style={{ flex: '1 1 0%' }}>
          <h3
            style={{
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              marginBottom: '0.25rem'
            }}
          >
            {title}
          </h3>
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem'
            }}
          >
            {message}
          </div>
        </div>
        <button
          onClick={handleClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: '0.25rem',
            marginLeft: '0.5rem'
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          height: '0.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: getTypeColor(),
            width: `${progress}%`,
            transition: 'width 1s linear'
          }}
        />
      </div>
    </div>
  );
};

export const NotificationContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto',
        width: '100%',
        maxWidth: '28rem',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          pointerEvents: 'auto'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Notification context for managing notifications
import { createContext, useContext } from 'react';

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, 'id'>) => string;
  closeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => '',
  closeNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const showNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
    return id;
  };

  const closeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, closeNotification }}>
      {children}
      <NotificationContainer>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={() => closeNotification(notification.id)}
          />
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};
