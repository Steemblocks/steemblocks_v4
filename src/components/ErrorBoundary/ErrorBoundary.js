import React from "react";
import { useRouteError, Link } from "react-router-dom";

const ErrorBoundary = () => {
  const error = useRouteError();

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height)-120px)] flex flex-col justify-center items-center px-4 py-6" style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      {/* Error Card */}
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        padding: 'clamp(1rem, 4vw, 2rem)'
      }}>
        <div className="text-center">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6" style={{
              background: 'linear-gradient(135deg, #06d6a0, #0ea5e9)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>404</h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
              Page Not Found
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 px-2" style={{ color: 'var(--text-secondary)' }}>
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="inline-block font-semibold py-3 px-6 sm:py-3 sm:px-8 rounded-lg transition-all duration-200 transform hover:scale-105 text-base sm:text-lg"
              style={{
                background: 'linear-gradient(135deg, #06d6a0, #0ea5e9)',
                color: '#1e293b',
                boxShadow: '0 4px 12px rgba(6, 214, 160, 0.3)',
                textDecoration: 'none',
                lineHeight: '1.2'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 6px 20px rgba(6, 214, 160, 0.4)';
                e.target.style.transform = 'scale(1.05) translateY(-2px)';
                e.target.style.textDecoration = 'none';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 4px 12px rgba(6, 214, 160, 0.3)';
                e.target.style.transform = 'scale(1)';
                e.target.style.textDecoration = 'none';
              }}
            >
              Go Back Home
            </Link>

            <div className="w-full p-3 sm:p-4 rounded-lg" style={{
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.2)'
            }}>
              <p className="text-xs sm:text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                Error details: {error?.statusText || error?.message || "Unknown error"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};export default ErrorBoundary;
