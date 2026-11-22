import {createFileRoute,Link} from '@tanstack/react-router';
import {useState} from 'react';
import {Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {PageHeading,SessionCard,pageHead} from '@/components/spa-shared';
import {useSpa} from '@/lib/spa-context';
export const Route=createFileRoute('/active-services')({head:()=>pageHead('Active Services','Monitor individual spa treatments and manage customer visits.'),component:ActiveServices});
function ActiveServices(){const {visits,customers}=useSpa();const [query,setQuery]=useState('');const [status,setStatus]=useState('In Progress');const results=visits.filter(v=>(status==='All'||v.status===status)&&`${customers.find(c=>c.id===v.customerId)?.name} ${v.id}`.toLowerCase().includes(query.toLowerCase()));return <><PageHeading title="Active Services" description="Exceptional care, from the first treatment to the last."><Button asChild><Link to="/create-service"><Plus/>Create New Service</Link></Button></PageHeading><div className="filters !px-0 mb-6"><input aria-label="Search active services" placeholder="Search guest or visit reference…" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Visit status" value={status} onChange={e=>setStatus(e.target.value)}>{['In Progress','Checked In','Completed','All'].map(s=><option key={s}>{s}</option>)}</select></div><div className="staff-grid">{results.map(v=><SessionCard key={v.id} visit={v}/>)}</div>{!results.length&&<div className="empty">No visits match your search.</div>}</>}
