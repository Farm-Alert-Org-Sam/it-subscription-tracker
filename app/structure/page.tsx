import type { Metadata } from 'next'
import { AppShell, PageIntro } from '@/components/app-shell'
import { StructureDiagrams } from '@/components/structure-diagrams'

export const metadata: Metadata = { title: 'Website Structure | Farm Alert Tech', robots: { index: false, follow: false } }

export default function StructurePage() {
  return <AppShell><main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8"><PageIntro eyebrow="Internal documentation" title="Website structure" description="A visual map of the routes, user journeys, and data services currently implemented in Farm Alert Tech." /><div className="mt-6 rounded-2xl border border-[#dfe9e7] bg-[#f5faf8] p-4 text-sm text-[#405a5e]"><strong>Legend:</strong> blue nodes are authenticated dashboard areas, green nodes are public or data services, and amber nodes are decisions, external services, or authentication paths. This page is intentionally not included in public navigation.</div><div className="mt-6"><StructureDiagrams /></div></main></AppShell>
}
