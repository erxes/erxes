import { HomeForYou } from '@/home/components/HomeForYou';
import { HomeRecent } from '@/home/components/HomeRecent';
import { HomeStarred } from '@/home/components/HomeStarred';
import { HomePath } from '@/types/paths/HomePath';
import { Route, Routes } from 'react-router';

export const HomeRoutes = () => (
  <Routes>
    <Route path={HomePath.Index} element={<HomeForYou />} />
    <Route path={HomePath.Recent} element={<HomeRecent />} />
    <Route path={HomePath.Starred} element={<HomeStarred />} />
  </Routes>
);
