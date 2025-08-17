'use client'

import TermsGate from '@/components/auth/TermsGate'
import useSWR from 'swr'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import SimpleTopbar from '@/components/site/SimpleTopbar'

const fetcher = (u: string) => fetch(u).then(r => r.json())

export default function CasesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('updatedAt_desc')

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    p.set('search', search)
    p.set('status', status)
    p.set('sort', sort)
    return p.toString()
  }, [search, status, sort])

  const { data, isLoading } = useSWR<{ items: any[] }>(`/api/cases?${qs}`, fetcher)

  return (
    <main>
      <TermsGate />
      <SimpleTopbar />
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-semibold">Cases</h1>
          <Link href="/cases/new" className="px-3 py-2 border rounded bg-black text-white">New Case</Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Search by title/applicant/email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="border rounded px-3 py-2" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="in_review">In review</option>
            <option value="awaiting_client">Awaiting client</option>
            <option value="documents_pending">Documents pending</option>
            <option value="payment_due">Payment due</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
          <select className="border rounded px-3 py-2" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="updatedAt_desc">Updated (new → old)</option>
            <option value="updatedAt_asc">Updated (old → new)</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (data?.items?.length ?? 0) === 0 ? (
          <div className="rounded border p-6 text-sm text-muted-foreground">No cases found</div>
        ) : (
          <ul className="grid gap-2">
            {data!.items.map(c => (
              <li key={c.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.applicantName} • {c.applicantEmail}
                  </div>
                </div>
                <Link href={`/cases/${c.id}`} className="px-3 py-1.5 border rounded">Open</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
