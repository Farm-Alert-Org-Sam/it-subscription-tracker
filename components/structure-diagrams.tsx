'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

const diagrams = [
  { id: 'site-map', title: '1. Site map', description: 'Public, authentication, dashboard, and protected management routes.', code: `flowchart TD
    Root["/ Landing"] --> Login["/login · login required for app"]
    Root --> PublicCatalog["/catalog · public"]
    Root --> PublicOnboarding["/onboarding/:token · public"]
    Root --> PublicBranding["/branding-request · public"]
    Login --> Dashboard["/ dashboard"]
    Dashboard --> Admin["/admin"]
    Dashboard --> Settings["/settings"]
    Dashboard --> ChangePassword["/change-password"]
    Dashboard --> Subscriptions["/subscriptions"]
    Dashboard --> Cameras["/cameras"]
    Dashboard --> Calendar["/calendar"]
    Dashboard --> Forecast["/forecast"]
    Dashboard --> Uptime["/uptime"]
    Dashboard --> Backups["/backups"]
    Dashboard --> BrandingRequests["/branding-requests"]
    Dashboard --> OnboardingManager["/onboarding"]
    Dashboard --> CatalogManager["/catalog-manager"]
    Dashboard --> Experience["/experience-manager"]
    Dashboard --> Attendance["/attendance"]
    Admin --> Access["workspace member access"]
    Login --> NoAccess["/no-access"]
    Login --> Reset["/reset-password"]
    classDef public fill:#e5f5f1,stroke:#176b71,color:#183b3b
    classDef protected fill:#eef0ff,stroke:#5865b8,color:#24305d
    classDef auth fill:#fff2d9,stroke:#b7791f,color:#593b0b
    class Root,PublicCatalog,PublicOnboarding,PublicBranding public
    class Dashboard,Admin,Settings,ChangePassword,Subscriptions,Cameras,Calendar,Forecast,Uptime,Backups,BrandingRequests,OnboardingManager,CatalogManager,Experience,Attendance,Access protected
    class Login,NoAccess,Reset auth` },
  { id: 'user-flow', title: '2. User flowchart', description: 'Observed authentication, dashboard, onboarding, catalog, attendance, and notification journeys.', code: `flowchart TD
    Start([Open Farm Alert]) --> Logged{"Logged in?"}
    Logged -- No --> Login["/login"]
    Login --> Credentials["Submit email and password"]
    Credentials --> Authenticated{"Credentials valid?"}
    Authenticated -- No --> LoginError["Show login error"] --> Login
    Authenticated -- Yes --> FirstLogin{"First login?"}
    Logged -- Yes --> FirstLogin
    FirstLogin -- Yes --> Tutorial["Onboarding/tutorial page"] --> Dashboard["Dashboard"]
    FirstLogin -- No --> Dashboard
    Dashboard --> PageAccess{"Granted access to page?"}
    PageAccess -- No --> NoAccess["/no-access"]
    PageAccess -- Yes --> Action["Open authorized manager page"]
    Action --> Save["Add, edit, or delete record"]
    Save --> SharedDB["Shared database tables"]
    SharedDB --> Refresh["Other dashboards revalidate on interval/focus"]
    Action --> AttendanceAction["Employee attendance clock-in"]
    AttendanceAction --> AttendanceDB["Attendance API + photo storage"]
    Action --> Subscription["Add subscription / renewal reminder"]
    Subscription --> Email["Resend email alert"]
    Action --> Birthday["Birthday reminder / Send now"]
    Birthday --> Email
    Action --> Catalog["Catalog / public request flow"]
    Catalog --> PublicView["Public catalog or onboarding token"]
    classDef decision fill:#fff2d9,stroke:#b7791f,color:#593b0b
    classDef service fill:#e5f5f1,stroke:#176b71,color:#183b3b
    class Logged,Authenticated,FirstLogin,PageAccess decision
    class SharedDB,AttendanceDB,Email,Refresh service` },
  { id: 'data-flow', title: '3. System and data flow', description: 'The actual application layers and integrations found in this project.', code: `flowchart LR
    Browser["Next.js pages and React components"] --> Auth["Better Auth /api/auth"]
    Browser --> APIs["Next.js API routes"]
    APIs --> DB[("Neon Postgres / Drizzle tables")]
    APIs --> Blob["Vercel Blob\nattendance photos and uploads"]
    APIs --> Resend["Resend\nemail notifications"]
    APIs --> PublicAPI["Public catalog, onboarding, branding request routes"]
    DB --> APIs
    Blob --> APIs
    Resend --> Mailbox["Recipient inboxes"]
    Browser --> PublicAPI
    PublicAPI --> DB
    Members["Workspace members and page access"] --> Auth
    Members --> APIs
    Cron["Vercel scheduled birthday route"] --> Resend
    Cron --> DB
    classDef frontend fill:#eef0ff,stroke:#5865b8,color:#24305d
    classDef backend fill:#e5f5f1,stroke:#176b71,color:#183b3b
    classDef external fill:#fff2d9,stroke:#b7791f,color:#593b0b
    class Browser frontend
    class Auth,APIs,DB,PublicAPI backend
    class Blob,Resend,Mailbox,Members,Cron external` }
]

function DiagramCard({ diagram }: { diagram: typeof diagrams[number] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState('')
  const [zoom, setZoom] = useState(1)
  useEffect(() => { mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: { fontFamily: 'Inter, ui-sans-serif, system-ui', primaryColor: '#eef0ff', primaryTextColor: '#183b3b', primaryBorderColor: '#5865b8', lineColor: '#718286', secondaryColor: '#e5f5f1', tertiaryColor: '#fff2d9' } }); mermaid.render(`structure-${diagram.id}`, diagram.code).then(({ svg: rendered }) => setSvg(rendered)).catch(() => setSvg('<p>Unable to render this diagram.</p>')) }, [diagram])
  const download = () => { const image = new Image(); image.onload = () => { const canvas = document.createElement('canvas'); canvas.width = image.width * 2; canvas.height = image.height * 2; const context = canvas.getContext('2d'); if (!context) return; context.fillStyle = 'white'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height); const link = document.createElement('a'); link.download = `${diagram.id}.png`; link.href = canvas.toDataURL('image/png'); link.click() }; image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` }
  useEffect(() => { const handleDownloadAll = () => download(); window.addEventListener('structure-download-all', handleDownloadAll); return () => window.removeEventListener('structure-download-all', handleDownloadAll) }, [svg, diagram.id])
  return <section className="rounded-2xl border border-[#dfe9e7] bg-white p-5 shadow-sm print:break-inside-avoid"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="text-xl font-extrabold text-[#183b3b]">{diagram.title}</h2><p className="mt-1 text-sm text-[#687a7a]">{diagram.description}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => setZoom((value) => Math.max(.65, value - .15))} className="rounded-lg border px-2 py-1 text-sm" aria-label="Zoom out">−</button><span className="min-w-12 text-center text-xs text-[#687a7a]">{Math.round(zoom * 100)}%</span><button type="button" onClick={() => setZoom((value) => Math.min(1.8, value + .15))} className="rounded-lg border px-2 py-1 text-sm" aria-label="Zoom in">+</button></div></div><div ref={containerRef} className="mt-5 max-h-[620px] overflow-auto rounded-xl bg-[#fbfdfc] p-4"><div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} dangerouslySetInnerHTML={{ __html: svg }} /></div><button type="button" onClick={download} disabled={!svg} className="mt-4 rounded-lg bg-[#176b71] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Download as PNG</button></section>
}

export function StructureDiagrams() { const downloadAll = () => window.dispatchEvent(new Event('structure-download-all')); return <div className="space-y-6"><div className="flex justify-end"><button type="button" onClick={downloadAll} className="rounded-lg border border-[#b9d9d4] px-4 py-2 text-sm font-bold text-[#176b71]">Download all</button></div>{diagrams.map((diagram) => <DiagramCard key={diagram.id} diagram={diagram} />)}<p className="text-xs text-[#687a7a]">Each diagram is rendered from Mermaid and can be zoomed, panned by scrolling, printed, or downloaded as a PNG from its section.</p></div> }
