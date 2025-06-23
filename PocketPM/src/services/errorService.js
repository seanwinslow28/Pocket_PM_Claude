// Error logging service for user testing
import * as Sentry from '@sentry/react-native';
import { config } from '../../config';

class ErrorService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    if (config.SENTRY_DSN && !this.initialized) {
      Sentry.init({
        dsn: config.SENTRY_DSN,
        environment: config.ENVIRONMENT,
        enabled: !config.USE_MOCK_DATA, // Only enable in production
        beforeSend(event) {
          // Filter out development errors
          if (config.USE_MOCK_DATA) {
            return null;
          }
          return event;
        }
      });
      this.initialized = true;
      console.log('✅ Sentry initialized for error tracking');
    }
  }

  // Log errors with context
  logError(error, context = {}) {
    const errorInfo = {
      ...context,
      timestamp: new Date().toISOString(),
      environment: config.ENVIRONMENT
    };

    // Always log to console for debugging
    console.error('Error logged:', {
      error: error.message || error,
      context: errorInfo
    });

    // Send to Sentry in production
    if (this.initialized) {
      Sentry.withScope((scope) => {
        // Add context to error
        Object.keys(errorInfo).forEach(key => {
          scope.setContext(key, errorInfo[key]);
        });
        
        // Capture the error
        if (typeof error === 'string') {
          Sentry.captureMessage(error, 'error');
        } else {
          Sentry.captureException(error);
        }
      });
    }
  }

  // Log user actions for debugging
  logUserAction(action, data = {}) {
    const actionInfo = {
      action,
      data,
      timestamp: new Date().toISOString(),
      environment: config.ENVIRONMENT
    };

    console.log('User action:', actionInfo);

    if (this.initialized) {
      Sentry.addBreadcrumb({
        message: action,
        level: 'info',
        data: actionInfo
      });
    }
  }

  // Set user context for better error tracking
  setUserContext(user) {
    if (this.initialized) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name
      });
    }
  }

  // Log performance metrics
  logPerformance(metric, duration, context = {}) {
    const perfInfo = {
      metric,
      duration,
      ...context,
      timestamp: new Date().toISOString()
    };

    console.log('Performance metric:', perfInfo);

    if (this.initialized) {
      Sentry.addBreadcrumb({
        message: `Performance: ${metric}`,
        level: 'info',
        data: perfInfo
      });
    }
  }
}

export default new ErrorService(); 