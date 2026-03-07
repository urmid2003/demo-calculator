import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled UI error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", color: '#a0522d' }}>
              Something went wrong
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Please refresh the page. If the issue persists, contact support.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

