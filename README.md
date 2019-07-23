# raviger

A React hook-based router but that updates on **all** url changes. Heavily inspired by [hookrouter](https://github.com/Paratron/hookrouter).

# Installation

```
npm i raviger
```

# Quick Start

```jsx
import { useRoutes, Link, useQueryParams } from 'raviger'

const routes = {
  '/': () => <Home />,
  '/about': () => <About />,
  '/users/:userId': ({ userId }) => <User id={userId} />
}

export default function App() {
  let route = useRoutes(routes)
  return (
    <div>
      <div>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/users/1">Tom</Link>
        <Link href="/users/2">Jane</Link>
      </div>
      {route}
    </div>
  )
}
```

## Query Strings

```javascript
import { useQueryParams } from 'raviger'

function UserList ({ users }) {
  const [{ startsWith }, setQuery] = useQueryParams()

  return (
    <div>
    <label>
      Filter by Name
      <input value={startsWith || ''} onChange={(e) => setQuery({ startsWith: e.target.value})} />
    </label>
    {users.filter(u => !startsWith || u.name.startsWith(startsWith).map(user => (
      <p key={user.name}>{user.name}</p>
    )))}
    </div>
  )
}
```

### Custom Query Serialization

Its possible to override either the querystring *serializer*, *deserializer*, or both, by providing functions to `useQueryParams`. Use a custom wrapper hook to reuse throughout your application.

```javascript
import { useQueryParams } from 'raviger'
import qs from 'qs'

export function useCustomQuery() {
  return useQueryParams(qs.parse, qs.stringify)
}
```

## Navigation

The preferred method for navigation is the `<Link>` component, which uses all the same properties as the standard `<a>` element, and requires `href`. If you need to perform programmatic navigation raviger exports a `navigate` function.

# API

## **useRoutes**

This hook is the main entry point for raviger.

* **useRoutes(routeMap, basePath): Route**

The first parameter is an object of path keys whose values are functions that return a **ReactElement**. The paths should start with a forward-slash `/` and then contain literal matches (`/base`), path variables (`/:userId`), and a `*` for catch-all wildcards. 

The second parameter can be a `basePath` that all routes must begin with, and all `Link`s in the sub-tree will be prepended with. This can be used for sites hosted at a base path, or for nested routers.

## **navigate**

This function causes programmatic navigation and cuases all raviger hooks to re-render. Internally it used by the `<Link>` component.

* **navigate(url, replace = false): void**

The url should be relative to the root, e.g. (`/some/path`). If the second parameter is truthy then `replaceState` will be used instead of `pushState`.

## **usePath**

Hook to return the current path portion.

* **usePath(basePath): string**

Like `useRoutes` it takes a `basePath` that will be removed from the returned path if present. This hook will cause re-rendering anytime the URL is changed, either with `<Link>` components, `navigate` or the `setQueryParams` function returned from `useQueryParams`.

## **useQueryParams**

This hooks, like `useState`, returns an array of `[queryParams, setQueryParams]` that contain the current deserialized query parameters and a setter function.

* **useQueryParams(parseFn, serializeFn): [queryParams, setQueryParams]``

The default parse and serialize functions utilized the browser built-in `URLSearchParams`. You can provide custom parse and serialize functions to control this behavior.

### **setQueryParams**

The second return value from **useQueryParams**, used to update the query string.

* **setQueryParams(newQueryParamsObj, replace = true)**

The first parameter takes an object that will be serialized into new query string parameters and sent to **navigate**. It will use the `serializeFn` provided to **useQueryParams**, or the default.

The second parameter, if provided as falsy, will *merge* the provided query paramters into the current query parameters. This is useful if you only want to update the provided values but keep the rest.

## **Link**

This component takes all the same parameters as the built-in `<a>` tag. It's `onClick` will be extended to perform local navigation, and if it is inside a component returned from `useRoutes` it will have the provided `basePath` preprended to its `href`.