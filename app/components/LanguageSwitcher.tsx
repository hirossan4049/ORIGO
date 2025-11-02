'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales, type Locale, defaultLocale } from '@/i18n/config'

const localeLabels: Record<Locale, string> = {
  en: 'English',
  ja: '日本語'
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: Locale) => {
    // Get the path without locale prefix
    const segments = pathname.split('/').filter(Boolean)
    const pathWithoutLocale = segments[0] && locales.includes(segments[0] as Locale)
      ? '/' + segments.slice(1).join('/')
      : pathname
    
    // Navigate to the new locale path
    // If it's the default locale, don't include it in the path
    const newPath = newLocale === defaultLocale 
      ? pathWithoutLocale || '/'
      : `/${newLocale}${pathWithoutLocale}`
    
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
            locale === loc
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-label={`Switch to ${localeLabels[loc]}`}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  )
}
