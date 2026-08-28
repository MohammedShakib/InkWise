"use client";

import { ReactNode } from 'react';
import { InkWiseProvider } from '../../lib/store/InkWiseContext';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return <InkWiseProvider>{children}</InkWiseProvider>;
}
