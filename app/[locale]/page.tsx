import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('home')

  if (session) {
    redirect('/dashboard')
  }

  const features = [
    {
      title: t('features.scheduleAnything.title'),
      description: t('features.scheduleAnything.description'),
    },
    {
      title: t('features.codeFirst.title'),
      description: t('features.codeFirst.description'),
    },
    {
      title: t('features.environmentControls.title'),
      description: t('features.environmentControls.description'),
    },
    {
      title: t('features.teamReady.title'),
      description: t('features.teamReady.description'),
    },
    {
      title: t('features.observableRuns.title'),
      description: t('features.observableRuns.description'),
    },
    {
      title: t('features.apiFriendly.title'),
      description: t('features.apiFriendly.description'),
    },
  ]

  const steps = [
    {
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
    },
    {
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
    },
    {
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        <div className="absolute -top-32 right-0 -z-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="mx-auto max-w-6xl px-6 pt-10 pb-24 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                OR
              </span>
              <span>ORIGO</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/login" className="text-slate-300 transition hover:text-white">
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-white/10 px-4 py-2 text-white shadow-lg shadow-blue-500/10 transition hover:bg-white/20"
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          </nav>

          <div className="mx-auto mt-20 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300">
              {t('hero.badge')}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              {t('hero.description')}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-lg bg-blue-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-400 sm:w-auto"
              >
                {t('hero.createAccount')}
              </Link>
              <Link
                href="/login"
                className="w-full rounded-lg border border-white/20 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:text-white sm:w-auto"
              >
                {t('hero.haveAccount')}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-blue-500/10 via-slate-900/60 to-transparent blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl shadow-blue-900/30 backdrop-blur">
              <div className="grid gap-8 p-8 lg:grid-cols-2">
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('showcase.title')}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    {t('showcase.description')}
                  </p>
                  <dl className="mt-8 grid grid-cols-1 gap-6 text-sm text-slate-300 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <dt className="font-semibold text-white">{t('showcase.cronIntelligence')}</dt>
                      <dd className="mt-2">
                        {t('showcase.cronDescription')}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <dt className="font-semibold text-white">{t('showcase.inlineLogs')}</dt>
                      <dd className="mt-2">
                        {t('showcase.inlineLogsDescription')}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
                  <div className="border-b border-white/5 bg-slate-900/60 px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                    schedules/reporting.ts
                  </div>
                  <pre className="overflow-x-auto p-6 text-xs leading-6 text-slate-100">
{`import { schedule } from "origo";

export const dailyReport = schedule("0 8 * * 1-5", async ({ log, env }) => {
  const users = await fetch(env.API_URL + "/active-users").then((res) => res.json());

  if (users.length === 0) {
    log("No active users today. Skipping email dispatch.");
    return;
  }

  await sendEmail({
    to: env.REPORT_RECIPIENTS.split(","),
    subject: "Daily activity summary",
    body: renderTemplate("daily-report", { users }),
  });

  log(\`Sent report to \${env.REPORT_RECIPIENTS}\`);
});`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="bg-slate-950">
        <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('features.title')}</h2>
            <p className="mt-4 text-base text-slate-300">
              {t('features.description')}
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-lg shadow-blue-900/10 transition hover:border-blue-500/40 hover:shadow-blue-900/30"
              >
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-x-0 top-0 -z-10 flex justify-center">
            <div className="h-40 w-[40rem] bg-blue-500/10 blur-3xl" />
          </div>
          <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('howItWorks.title')}</h2>
                <p className="mt-4 text-base text-slate-300">
                  {t('howItWorks.description')}
                </p>
                <div className="mt-10 space-y-6">
                  {steps.map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-300">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        <p className="mt-2 text-sm text-slate-300">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-blue-900/40">
                <h3 className="text-lg font-semibold text-white">{t('howItWorks.whySwitch')}</h3>
                <ul className="mt-6 space-y-4 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-300">
                      •
                    </span>
                    <p>{t('howItWorks.reason1')}</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-300">
                      •
                    </span>
                    <p>{t('howItWorks.reason2')}</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-300">
                      •
                    </span>
                    <p>{t('howItWorks.reason3')}</p>
                  </li>
                </ul>
                <div className="mt-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 text-sm text-blue-200">
                  “We replaced a patchwork of scripts and cronboxes with ORIGO and cut incident response time by 60%.”
                  <div className="mt-4 font-semibold text-white">{t('howItWorks.testimonialAuthor')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/10 via-slate-900 to-slate-950 p-12 text-center shadow-2xl shadow-blue-900/30">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('cta.title')}?</h2>
            <p className="mt-4 text-base text-slate-300">
              {t('cta.description')}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-lg bg-blue-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-400 sm:w-auto"
              >
                {t('cta.signUp')}
              </Link>
              <Link
                href="/login"
                className="w-full rounded-lg border border-white/20 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:text-white sm:w-auto"
              >
                {t('cta.loginWorkspace')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              OR
            </span>
            ORIGO
          </div>
          <p className="text-xs text-slate-500">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="transition hover:text-white">
              {t('footer.login')}
            </Link>
            <Link href="/register" className="transition hover:text-white">
              {t('footer.register')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
