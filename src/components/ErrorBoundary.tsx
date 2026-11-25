import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let displayMsg = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed?.error) {
          displayMsg = `${parsed.error} (${parsed.operationType || 'operation'} on ${parsed.path || 'database'})`;
        }
      } catch {
        // non-JSON message
      }

      return (
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E5E7EB] rounded-2xl p-8">
            <p className="text-xs font-medium tracking-wide text-[#315E9B] uppercase mb-2">
              Application Notice
            </p>
            <h1 className="text-xl font-semibold text-[#202124] mb-3">
              Unable to complete request
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-6 break-words">
              {displayMsg}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors"
            >
              Return to Portfolio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
