import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, createEmotionCache } from '@mantine/core';
import rtlPlugin from 'stylis-plugin-rtl';
import './App.css';
import MainLayout from 'layouts/MainLayout';

import Home from 'pages/Home';
import Log from 'pages/Log';
import AddInventory from 'pages/AddInventory';
import Backup from 'pages/Backup';
import Transfer from 'pages/Transfer';
import Places from 'pages/Places';

export default function App() {
  const rtlCache = createEmotionCache({
    key: 'mantine-rtl',
    stylisPlugins: [rtlPlugin],
  });
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      emotionCache={rtlCache}
      theme={{
        colorScheme: 'dark',
        dir: 'rtl',
        fontFamily: 'dana ,Tahoma, Arial, sans-serif',
      }}
    >
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="" element={<Home />} />
            <Route path="add" element={<AddInventory />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="places" element={<Places />} />
            <Route path="log" element={<Log />} />
            <Route path="backup" element={<Backup />} />
          </Route>
        </Routes>
      </Router>
    </MantineProvider>
  );
}
