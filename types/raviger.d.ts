import * as React from 'react'

export function useRoutes(
  routes: { [key: string]: (props: Object) => JSX.Element },
  options?: {
    basePath?: string
    routeProps?: Object
    overridePathParams?: boolean
  }
): JSX.Element

export function useRedirect(
  predicateUrl: string,
  targetUrl: string,
  queryParams?: Object | URLSearchParams,
  replace?: boolean
): void

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}
export const Link: React.FC<LinkProps>

export function navigate(url: string, replace?: boolean): void
export function navigate(
  url: string,
  query?: Object | URLSearchParams,
  replace?: boolean
): void

export function usePath(basePath?: string): string

export function useBasePath(): string

export function usePopState(
  basePath: string,
  predicate: () => boolean,
  setFn: (path: string) => any
): void

export function useQueryParams(
  parseFn?: (query: string) => Object,
  serializeFn?: (query: Object) => string
): [{ [key: string]: any }, (query: Object, replace?: boolean) => void]

export function useQueryParams<T>(
  parseFn?: (query: string) => Object,
  serializeFn?: (query: Object) => string
): [T, (query: Object, replace?: boolean) => void]

export function useQueryParams<T, Q>(
  parseFn?: (query: string) => Object,
  serializeFn?: (query: Object) => string
): [T, (query: Q, replace?: boolean) => void]