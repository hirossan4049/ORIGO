'use client'

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/app/components/AppLayout";

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-6">{useTranslations('common')('loading')}</div>;
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p>{t('welcome')}</p>
      </div>
    </AppLayout>
  );
}
