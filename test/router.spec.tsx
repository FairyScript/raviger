import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import {
  navigate,
  useRoutes,
  usePath,
  useBasePath,
  useQueryParams,
} from '../src'
import { RouteOptionParams, RouteParams } from '../src/types'

beforeEach(() => {
  act(() => navigate('/'))
})

describe('useRoutes', () => {
  function Harness({
    routes,
    options,
  }: {
    routes: RouteParams<string>
    options?: RouteOptionParams
  }) {
    const route = useRoutes(routes, options) || (
      <span data-testid="label">not found</span>
    )
    return route
  }

  function Route({ label, extra }: { label: string; extra?: string }) {
    let path = usePath()
    return (
      <div>
        <span data-testid="label">
          {label} {path}
        </span>
        <span data-testid="extra">{extra}</span>
      </div>
    )
  }
  const routes: RouteParams<string> = {
    '/': () => <Route label="home" />,
    '/about': ({ extra }) => <Route label="about" extra={extra} />,
    '/users/:userId': ({ userId }) => <Route label={`User ${userId}`} />,
  }

  test('matches current route', async () => {
    const { getByTestId } = render(<Harness routes={routes} />)

    act(() => navigate('/'))
    expect(getByTestId('label')).toHaveTextContent('home')
  })

  test('returns null when no match', async () => {
    const { getByTestId } = render(<Harness routes={routes} />)

    act(() => navigate('/missing'))
    expect(getByTestId('label')).toHaveTextContent('not found')
  })

  test('matches updated route', async () => {
    const { getByTestId } = render(<Harness routes={routes} />)

    act(() => navigate('/'))
    expect(getByTestId('label')).toHaveTextContent('home')

    act(() => navigate('/about'))
    expect(getByTestId('label')).toHaveTextContent('about')
  })

  test('matches trailing slash by default', async () => {
    const { getByTestId } = render(<Harness routes={routes} />)
    act(() => navigate('/'))
    act(() => navigate('/about/'))
    expect(getByTestId('label')).toHaveTextContent('about')
  })

  test('does not match trailing slash with option', async () => {
    const { getByTestId } = render(
      <Harness routes={routes} options={{ matchTrailingSlash: false }} />
    )
    act(() => navigate('/'))
    act(() => navigate('/about/'))
    expect(getByTestId('label')).toHaveTextContent('not found')
  })

  test('matches trailing slash with option', async () => {
    const { getByTestId } = render(
      <Harness routes={routes} options={{ matchTrailingSlash: true }} />
    )
    act(() => navigate('/'))
    act(() => navigate('/about/'))
    expect(getByTestId('label')).toHaveTextContent('about')
  })

  test('matches trailing slash on "/"', async () => {
    const { getByTestId } = render(
      <Harness routes={routes} options={{ matchTrailingSlash: true }} />
    )
    act(() => navigate('/'))
    expect(getByTestId('label')).toHaveTextContent('home')
  })

  test('matches route with parameters', async () => {
    const { getByTestId } = render(<Harness routes={routes} />)

    act(() => navigate('/users/1'))
    expect(getByTestId('label')).toHaveTextContent('User 1')
  })

  test('matches case insensitive rout', async () => {
    const { getByTestId } = render(<Harness routes={routes} />)

    act(() => navigate('/About'))
    expect(getByTestId('label')).toHaveTextContent('about')
  })

  // test('works with lazy routes', async () => {
  //     let loader = new Promise(resolve => {
  //         setTimeout(() => resolve({default: Route}), 50)
  //     })
  //     let Lazy = React.lazy(() => loader)
  //     const routes = {
  //         '/': () => <Route label="home" />,
  //         '/lazy': () => (
  //             <React.Suspense fallback={<span data-testid="label">loading</span>}>
  //                 <Lazy label="lazy" />
  //             </React.Suspense>
  //         ),
  //     }
  //     act(() => navigate('/'))
  //     const {getByTestId} = render(<Harness routes={routes} />)
  //     act(() => navigate('/lazy'))
  //     expect(getByTestId('label')).toHaveTextContent('loading')
  //     await loader
  //     act(() => navigate('/lazy'))
  //     expect(getByTestId('label')).toHaveTextContent('lazy')
  // })

  test('passes extra route props to route', async () => {
    const { getByTestId } = render(
      <Harness
        routes={routes}
        options={{ routeProps: { extra: 'injected' } }}
      />
    )
    act(() => navigate('/about'))
    expect(getByTestId('extra')).toHaveTextContent('injected')
  })

  test('overrides route props', async () => {
    const { getByTestId } = render(
      <Harness routes={routes} options={{ routeProps: { userId: 4 } }} />
    )
    act(() => navigate('/users/1'))
    expect(getByTestId('label')).toHaveTextContent('User 4')
  })

  test('underrides route props', async () => {
    const { getByTestId } = render(
      <Harness
        routes={routes}
        options={{ routeProps: { userId: 4 }, overridePathParams: false }}
      />
    )
    act(() => navigate('/users/1'))
    expect(getByTestId('label')).toHaveTextContent('User 1')
  })

  test('handles dynamic routes', async () => {
    const Harness = () => {
      const [myRoutes, setRoutes] = React.useState(routes)

      const addNewRoute = () => {
        setRoutes((prevRoutes) => ({
          ...prevRoutes,
          '/new': () => <Route label="new route" />,
        }))
      }

      const route = useRoutes(myRoutes) || (
        <span data-testid="label">not found</span>
      )

      return (
        <>
          {route}
          <button onClick={addNewRoute} data-testid="add-route">
            Add route
          </button>
        </>
      )
    }

    const { getByTestId } = render(<Harness />)
    act(() => navigate('/new'))
    expect(getByTestId('label')).not.toHaveTextContent('new route')

    const button = getByTestId('add-route')

    act(() => button.click())
    act(() => navigate('/new'))
    expect(getByTestId('label')).toHaveTextContent('new route')
  })

  describe('with basePath', () => {
    const routes = {
      '/': () => <Route label="home" />,
      '/about': () => <Route label="about" />,
    }

    test('matches current route', async () => {
      act(() => navigate('/foo'))
      const options = { basePath: '/foo' }
      const { getByTestId } = render(
        <Harness routes={routes} options={options} />
      )

      // act(() => navigate('/foo'))
      expect(getByTestId('label')).toHaveTextContent('home')
      act(() => navigate('/foo/about'))
      expect(getByTestId('label')).toHaveTextContent('about')
    })

    test('does not match current route', async () => {
      const options = { basePath: '/foo' }
      const { getByTestId } = render(
        <Harness routes={routes} options={options} />
      )

      act(() => navigate('/'))
      expect(getByTestId('label')).toHaveTextContent('not found')

      act(() => navigate('/about'))
      expect(getByTestId('label')).toHaveTextContent('not found')
    })

    test('nested router with basePath matches after navigation', async () => {
      const appRoutes: RouteParams<string> = {
        '/app/:id*': ({ id }) => SubRouter({ id }),
      }
      function App() {
        const route = useRoutes(appRoutes)
        return route || <NotFound />
      }
      function SubRouter({ id }: { id: string }) {
        const subRoutes = React.useMemo(
          () => ({
            '/settings': () => <RouteItem id={id} />,
          }),
          [id]
        )
        const route = useRoutes(subRoutes, { basePath: `/app/${id}` })
        return route || <NotFound />
      }
      function RouteItem({ id }: { id: string }) {
        return <span data-testid="label">{id}</span>
      }

      function NotFound() {
        return <span data-testid="label">Not Found</span>
      }
      act(() => navigate('/app/1/settings'))
      const { getByTestId } = render(<App />)

      expect(getByTestId('label')).toHaveTextContent('1')

      act(() => navigate('/app/2/settings'))
      expect(getByTestId('label')).toHaveTextContent('2')
    })
  })
})

describe('useBasePath', () => {
  function Harness({
    routes,
    basePath,
  }: {
    routes: RouteParams<string>
    basePath?: string
  }) {
    const route = useRoutes(routes, { basePath })
    return route
  }

  function Route() {
    let basePath = useBasePath()
    return <span data-testid="basePath">{basePath || 'none'}</span>
  }

  const nestedRoutes: RouteParams<unknown> = {
    '/': () => <Route />,
    '/about': () => <Route />,
  }

  const routes: RouteParams<unknown> = {
    '/': () => <Route />,
    '/about': () => <Route />,
    '/nested*': () => <Harness basePath="/nested" routes={nestedRoutes} />,
  }
  test('returns basePath inside useRoutes', async () => {
    const { getByTestId } = render(<Harness routes={routes} />)
    act(() => navigate('/'))
    expect(getByTestId('basePath')).toHaveTextContent('none')
    act(() => navigate('/about'))
    expect(getByTestId('basePath')).toHaveTextContent('none')
    act(() => navigate('/nested'))
    expect(getByTestId('basePath')).toHaveTextContent('nested')
    act(() => navigate('/Nested'))
    expect(getByTestId('basePath')).toHaveTextContent('nested')
  })
  test('returns empty string outside', async () => {
    const { getByTestId } = render(<Route />)
    act(() => navigate('/'))
    expect(getByTestId('basePath')).toHaveTextContent('none')
  })
})

describe('useQueryParams', () => {
  function Route({ label }: { label?: string }) {
    let [params, setQuery] = useQueryParams()
    return (
      <span data-testid="params" onClick={() => setQuery({ name: 'click' })}>
        {label}
        {JSON.stringify(params)}
      </span>
    )
  }
  test('returns current params', async () => {
    act(() => navigate('/?name=test'))
    const { getByTestId } = render(<Route />)

    expect(getByTestId('params')).toHaveTextContent('name":"test')
  })

  test('returns updated params', async () => {
    act(() => navigate('/?name=test'))
    const { getByTestId } = render(<Route />)
    act(() => navigate('/?name=updated'))

    expect(getByTestId('params')).toHaveTextContent('name":"updated')
  })

  test('sets query', async () => {
    act(() => navigate('/?name=test'))
    const { getByTestId } = render(<Route />)
    act(() => void fireEvent.click(getByTestId('params')))

    expect(getByTestId('params')).toHaveTextContent('name":"click')
  })
})

describe('navigate', () => {
  test('updates the url', async () => {
    act(() => navigate('/'))
    expect(window.location.toString()).toEqual('http://localhost/')
    act(() => navigate('/home'))
    expect(window.location.toString()).toEqual('http://localhost/home')
    // console.log(window.location.toString())
  })
  test('allows query string objects', async () => {
    // console.log(URLSearchParams)
    act(() => navigate('/', { q: 'name', env: 'test' }))
    expect(window.location.search).toContain('q=name')
    expect(window.location.search).toContain('env=test')
  })
  // test('throws when url is an object', async () => {
  //     expect(() => navigate({})).toThrow(/must be a string/)
  // })
})
