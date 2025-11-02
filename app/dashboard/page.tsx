'use client'

import { AppLayout } from "@/app/components/AppLayout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to the dashboard.</p>
      </div>
    </AppLayout>
  );
}
