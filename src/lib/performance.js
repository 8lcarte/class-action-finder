const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Configuration for bundle analyzer
});

// Redis cache configuration
const cacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || '',
  ttl: 60 * 60, // 1 hour default cache TTL
};

// Database query optimization
const optimizeQueries = () => {
  // Add indexes to frequently queried fields
  // Implement query caching for expensive operations
  // Use pagination and limit results for large datasets
};

// Image optimization configuration
const imageOptimizationConfig = {
  formats: ['webp', 'avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  domains: ['classactionfinder.com'],
  path: '/_next/image',
  loader: 'default',
  minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
};

// API response optimization
const optimizeApiResponses = () => {
  // Implement response compression
  // Use HTTP/2 for multiplexing
  // Implement proper caching headers
  // Return only necessary fields
};

// Frontend optimization techniques
const frontendOptimizations = {
  // Code splitting
  splitChunks: {
    chunks: 'all',
    maxInitialRequests: 25,
    minSize: 20000
  },
  
  // Tree shaking
  usedExports: true,
  
  // Lazy loading
  lazyLoad: {
    enabled: true,
    threshold: 200, // pixels
  },
  
  // CSS optimization
  cssOptimization: {
    minimize: true,
    discardComments: { removeAll: true },
  },
  
  // Font optimization
  fontOptimization: {
    preload: true,
    preconnect: true,
    display: 'swap',
  }
};

// CDN configuration
const cdnConfig = {
  enabled: process.env.USE_CDN === 'true',
  domain: process.env.CDN_DOMAIN || 'cdn.classactionfinder.com',
  paths: ['/static/', '/images/', '/assets/'],
};

// Performance monitoring
const performanceMonitoring = {
  metrics: [
    'FCP', // First Contentful Paint
    'LCP', // Largest Contentful Paint
    'CLS', // Cumulative Layout Shift
    'FID', // First Input Delay
    'TTFB', // Time to First Byte
  ],
  thresholds: {
    FCP: 1800, // ms
    LCP: 2500, // ms
    CLS: 0.1,
    FID: 100, // ms
    TTFB: 800, // ms
  },
  reportTo: '/api/performance-report',
};

module.exports = {
  cacheConfig,
  optimizeQueries,
  imageOptimizationConfig,
  optimizeApiResponses,
  frontendOptimizations,
  cdnConfig,
  performanceMonitoring,
};
