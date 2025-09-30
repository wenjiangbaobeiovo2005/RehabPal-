import React, { Component, ErrorInfo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Error boundary component to catch and handle errors gracefully
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops, something went wrong!</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text style={styles.errorNote}>
            Please restart the application to continue.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Import the Expo Router App component
const { App: ExpoRouterApp } = require('expo-router/build/qualified-entry');

// Main App component with error boundary wrapping the Expo Router App
export default function App() {
  return (
    <ErrorBoundary>
      <ExpoRouterApp />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});