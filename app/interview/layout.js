'use client';

import {InterviewContext} from '@/context/InterviewContext';
import { Inter } from 'next/font/google';
import '../globals.css';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function InterviewLayout({ children }) {
  const [interviewInfo , setInterviewInfo] = useState(null);
  return (
    <InterviewContext.Provider value={{interviewInfo , setInterviewInfo}}>
      <html lang="en">
        <body className={`${inter.className} bg-gray-950 text-white`}>
          {children}
        </body>
      </html>
    </InterviewContext.Provider>
  );
}
