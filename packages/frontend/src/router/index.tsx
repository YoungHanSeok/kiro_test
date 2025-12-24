/**
 * 라우터 설정
 */


import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { 
  HomePage, 
  ThemePage, 
  WallpaperDetailPage, 
  FavoritesPage 
} from '../pages'

const NotFoundPage = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>404</h1>
    <h2 style={{ margin: '0 0 1rem 0' }}>페이지를 찾을 수 없습니다</h2>
    <p style={{ color: '#6b7280', margin: '0 0 2rem 0' }}>
      요청하신 페이지가 존재하지 않습니다.
    </p>
    <a 
      href="/" 
      style={{ 
        background: '#3b82f6', 
        color: 'white', 
        padding: '0.75rem 1.5rem', 
        borderRadius: '8px', 
        textDecoration: 'none',
        fontWeight: '500'
      }}
    >
      홈으로 돌아가기
    </a>
  </div>
)

// 라우터 설정
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/theme/:themeId',
    element: <ThemePage />
  },
  {
    path: '/wallpaper/:wallpaperId',
    element: <WallpaperDetailPage />
  },
  {
    path: '/favorites',
    element: <FavoritesPage />
  }
])

// 라우터 Provider 컴포넌트
export function AppRouter() {
  return <RouterProvider router={router} />
}