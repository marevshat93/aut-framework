import fetch, { RequestInit, Response } from 'node-fetch';
import { Logger } from '../core/logger';
import { getServiceBaseUrl } from '../core/env';

export interface ApiRequestOptions extends RequestInit {
  /**
   * Optional per-request description for logging and reporting.
   */
  description?: string;
}

export abstract class BaseApiClient {
  protected readonly baseUrl: string;

  constructor(
    protected readonly serviceKey: string,
    protected readonly logger: Logger,
  ) {
    this.baseUrl = getServiceBaseUrl(serviceKey);
    this.logger.info(`Initialized API client for service "${serviceKey}" with base URL "${this.baseUrl}"`);
  }

  protected buildUrl(path: string): string {
    const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
    return `${this.baseUrl}/${trimmedPath}`;
  }

  protected async request<T = unknown>(method: string, path: string, options: ApiRequestOptions = {}): Promise<T> {
    const url = this.buildUrl(path);
    const { description, headers, ...rest } = options;

    const requestDescription = description || `${method.toUpperCase()} ${url}`;
    this.logger.info(`API REQUEST: ${requestDescription}`, {
      method,
      url,
      headers,
    });

    const init: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      ...rest,
    };

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err) {
      this.logger.error(`Network error for ${requestDescription}`, err as Error);
      throw err;
    }

    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson && text ? (JSON.parse(text) as T) : (text as unknown as T);

    this.logger.info(`API RESPONSE: ${requestDescription}`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body,
    });

    if (!response.ok) {
      const error = new Error(`API request failed with status ${response.status} (${response.statusText})`) as Error & { statusCode?: number };
      error.statusCode = response.status;
      this.logger.error(error.message, error, { body });
      throw error;
    }

    return body;
  }

  protected get<T = unknown>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  protected post<T = unknown>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('POST', path, {
      ...options,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  protected put<T = unknown>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', path, {
      ...options,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  protected patch<T = unknown>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', path, {
      ...options,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  protected delete<T = unknown>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }
}

