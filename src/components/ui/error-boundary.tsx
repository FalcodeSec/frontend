"use client";

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { AlertTriangle, RefreshCw, ExternalLink, Settings, Bug, Home } from 'lucide-react';

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

/**
 * Error fallback props
 */
interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  retry: () => void;
  resetErrorBoundary: () => void;
  level?: 'page' | 'component' | 'critical';
}

/**
 * Enhanced Error Boundary with better error handling and recovery
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for monitoring
    this.logError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset on props change if enabled
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }

    // Reset on key change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) =>
        prevProps.resetKeys![index] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In production, send to monitoring service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      level: this.props.level || 'component',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
  };

  retry = () => {
    this.resetErrorBoundary();
  };

  render() {
    if (this.state.hasError) {
      const fallbackProps: ErrorFallbackProps = {
        error: this.state.error!,
        errorInfo: this.state.errorInfo,
        retry: this.retry,
        resetErrorBoundary: this.resetErrorBoundary,
        level: this.props.level,
      };

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent {...fallbackProps} />;
      }

      return <DefaultErrorFallback {...fallbackProps} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({
  error,
  retry,
  level = 'component'
}: ErrorFallbackProps) {
  const isPageLevel = level === 'page';
  const isCritical = level === 'critical';

  const getErrorTitle = () => {
    if (isCritical) return 'Critical Error';
    if (isPageLevel) return 'Page Error';
    return 'Something went wrong';
  };

  const getErrorDescription = () => {
    if (isCritical) {
      return 'A critical error occurred that requires immediate attention. Please contact support.';
    }
    if (isPageLevel) {
      return 'This page encountered an error. You can try refreshing or navigate to another page.';
    }
    return 'An unexpected error occurred in this component. Please try again.';
  };

  return (
    <div className={`flex items-center justify-center p-4 ${isPageLevel ? 'min-h-screen' : 'min-h-[400px]'}`}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>{getErrorTitle()}</span>
          </CardTitle>
          <CardDescription>
            {getErrorDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <Bug className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="font-mono text-sm break-all">
              {error.message}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col space-y-2">
            <Button onClick={retry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            {isPageLevel && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Developer Details
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Specific error components for different scenarios

interface GitHubErrorProps {
  error: string;
  installationUrl?: string;
  onRetry?: () => void;
}

export function GitHubInstallationError({ error, installationUrl, onRetry }: GitHubErrorProps) {
  return (
    <Alert variant="destructive">
      <ExternalLink className="h-4 w-4" />
      <AlertTitle>GitHub App Installation Required</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {installationUrl && (
            <Button asChild size="sm">
              <a href={installationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Install GitHub App
              </a>
            </Button>
          )}
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface PermissionErrorProps {
  error: string;
  settingsUrl?: string;
  onRetry?: () => void;
}

export function PermissionError({ error, settingsUrl, onRetry }: PermissionErrorProps) {
  return (
    <Alert variant="destructive">
      <Settings className="h-4 w-4" />
      <AlertTitle>Permission Required</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {settingsUrl && (
            <Button asChild size="sm">
              <a href={settingsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Permissions
              </a>
            </Button>
          )}
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface SyncErrorProps {
  error: string;
  onSync?: () => void;
  isLoading?: boolean;
}

export function SyncError({ error, onSync, isLoading }: SyncErrorProps) {
  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Sync Issue</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error}</p>
        {onSync && (
          <Button 
            size="sm" 
            onClick={onSync} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface NetworkErrorProps {
  error: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function NetworkError({ error, onRetry, isRetrying }: NetworkErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry} 
            disabled={isRetrying}
            className="w-full sm:w-auto"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </>
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Specialized Error Boundary Components
 */

/**
 * Page-level error boundary
 */
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        console.error('Page Error:', error, errorInfo);
        // TODO: Send to monitoring service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-level error boundary
 */
export function ComponentErrorBoundary({
  children,
  name
}: {
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <ErrorBoundary
      level="component"
      onError={(error, errorInfo) => {
        console.error(`Component Error${name ? ` in ${name}` : ''}:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * API error boundary for data fetching components
 */
export function APIErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      level="component"
      fallback={({ retry }) => (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to load data</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Unable to fetch the requested data. Please try again.</p>
            <Button onClick={retry} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Critical error boundary for essential app functionality
 */
export function CriticalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      level="critical"
      onError={(error, errorInfo) => {
        console.error('Critical Error:', error, errorInfo);
        // TODO: Send urgent alert to monitoring service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for handling errors in components
export function useErrorHandler() {
  const [error, setError] = React.useState<string | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleError = React.useCallback((error: unknown) => {
    console.error('Component error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    setError(message);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retry = React.useCallback(async (retryFn: () => Promise<void>) => {
    setIsRetrying(true);
    try {
      await retryFn();
      clearError();
    } catch (error) {
      handleError(error);
    } finally {
      setIsRetrying(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry,
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
