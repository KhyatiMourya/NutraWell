import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
export default Layout;
