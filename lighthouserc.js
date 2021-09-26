module.exports = {
  ci: {
    upload: {
      target: 'temporary-public-storage'
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'csp-xss': 'warn',
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    collect: {
      url: ['http://127.0.0.1:3000'],
      staticDistDir: './build',
      startServerCommand: 'http-server ./build -p 3000 -g',
      isSinglePageApplication: true
    }
  }
};
