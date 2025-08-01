export interface EnvironmentConfig {
  name: string;
  apiBaseUrl: string;
  timeout: number;
  enableLogging: boolean;
  retryAttempts: number;
  requestDelay: number;
  features: {
    enableAnalytics: boolean;
    enableCaching: boolean;
    enableDebugMode: boolean;
  };
}

export const environments: Record<string, EnvironmentConfig> = {
  local: {
    name: 'Local Development',
    apiBaseUrl: 'https://intutr-kmap-app.onrender.com/api/v1',
    timeout: 30000,
    enableLogging: true,
    retryAttempts: 1,
    requestDelay: 0,
    features: {
      enableAnalytics: false,
      enableCaching: false,
      enableDebugMode: true,
    },
  },
  dev: {
    name: 'Development',
    apiBaseUrl: 'https://intutr-kmap-app.onrender.com/api/v1',
    timeout: 15000,
    enableLogging: true,
    retryAttempts: 2,
    requestDelay: 100,
    features: {
      enableAnalytics: false,
      enableCaching: true,
      enableDebugMode: true,
    },
  },
  qa: {
    name: 'Quality Assurance',
    apiBaseUrl: 'https://api-qa.yourapp.com/api/v1',
    timeout: 15000,
    enableLogging: true,
    retryAttempts: 3,
    requestDelay: 200,
    features: {
      enableAnalytics: true,
      enableCaching: true,
      enableDebugMode: false,
    },
  },
  prod: {
    name: 'Production',
    apiBaseUrl: 'https://api.yourapp.com/api/v1',
    timeout: 20000,
    enableLogging: false,
    retryAttempts: 3,
    requestDelay: 300,
    features: {
      enableAnalytics: true,
      enableCaching: true,
      enableDebugMode: false,
    },
  },
};

// Get current environment from URL param, localStorage, or default to local
export const getCurrentEnvironment = (): string => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return 'local';
  }

  try {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlEnv = urlParams.get('env');
    if (urlEnv && environments[urlEnv]) {
      localStorage.setItem('selectedEnvironment', urlEnv);
      return urlEnv;
    }

    // Check localStorage
    const savedEnv = localStorage.getItem('selectedEnvironment');
    if (savedEnv && environments[savedEnv]) {
      return savedEnv;
    }
  } catch (error) {
    console.warn('Error accessing browser storage, defaulting to local environment:', error);
  }

  // Default to local
  return 'local';
};

// Get current environment configuration
export const getConfig = (): EnvironmentConfig => {
  const currentEnv = getCurrentEnvironment();
  return environments[currentEnv];
};

// Switch environment
export const switchEnvironment = (env: string): void => {
  if (environments[env]) {
    localStorage.setItem('selectedEnvironment', env);
    // Reload the page to apply new configuration
    window.location.reload();
  } else {
    console.error(`Environment '${env}' not found`);
  }
};

// Get available environment names
export const getAvailableEnvironments = (): string[] => {
  return Object.keys(environments);
};