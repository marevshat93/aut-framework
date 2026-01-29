export type EnvironmentName = 'local' | 'dev' | 'qa' | 'staging' | 'prod';

export interface ServiceConfig {
  name: string;
  baseUrl: string;
}

export interface EnvironmentConfig {
  name: EnvironmentName;
  services: Record<string, ServiceConfig>;
}

/**
 * Centralized environment & base URL configuration.
 * Easily extend this with additional services or environments.
 */
export const ENVIRONMENTS: Record<EnvironmentName, EnvironmentConfig> = {
  local: {
    name: 'local',
    services: {
      sampleApi: {
        name: 'Sample Public API',
        baseUrl: 'https://jsonplaceholder.typicode.com',
      },
      dummyJSON: {
        name: 'Dummy JSON API',
        baseUrl: 'https://dummyjson.com',
      },
    },
  },
  dev: {
    name: 'dev',
    services: {
      sampleApi: {
        name: 'Sample Public API',
        baseUrl: 'https://jsonplaceholder.typicode.com',
      },
    },
  },
  qa: {
    name: 'qa',
    services: {
      sampleApi: {
        name: 'Sample Public API',
        baseUrl: 'https://jsonplaceholder.typicode.com',
      },
    },
  },
  staging: {
    name: 'staging',
    services: {
      sampleApi: {
        name: 'Sample Public API',
        baseUrl: 'https://jsonplaceholder.typicode.com',
      },
    },
  },
  prod: {
    name: 'prod',
    services: {
      sampleApi: {
        name: 'Sample Public API',
        baseUrl: 'https://jsonplaceholder.typicode.com',
      },
    },
  },
};

// get environment name from TEST_ENV environment variable or 'local' as default
export function getEnvironmentName(): EnvironmentName {
  const fromEnv = (process.env.TEST_ENV || 'local').toLowerCase() as EnvironmentName;
  if (!ENVIRONMENTS[fromEnv]) {
    return 'local';
  }
  return fromEnv;
}

/** get service base url from environment name and service key 
 * @throws an error if the service is not configured for the environment
 * @param serviceKey - the key of the service to get the base url for
 * @returns the base url for the service
*/

export function getServiceBaseUrl(serviceKey: string): string {
  const envName = getEnvironmentName();
  const envConfig = ENVIRONMENTS[envName];
  const service = envConfig.services[serviceKey];
  if (!service) {
    throw new Error(`Service "${serviceKey}" is not configured for environment "${envName}"`);
  }
  return service.baseUrl.replace(/\/+$/, '');
}

