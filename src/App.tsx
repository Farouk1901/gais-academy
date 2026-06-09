// BrowserRouter + AuthProvider are mounted in main.tsx — do NOT add them here.
import { Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { routes } from './routes';

export default function App() {
  return (
    <>
      <IntersectObserver />
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  );
}



