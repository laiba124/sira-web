"use client";
import { useIsMobile } from "@/lib/useIsMobile";
import MobileAlerts from "@/components/mobile/screens/MobileAlerts";
import Link from "next/link"; import { useEffect,useMemo,useState } from "react"; import PageHeader from "@/components/PageHeader"; import { listIncidents } from "@/lib/incidents"; import type { SiraIncident } from "@/types/incident"; import { formatDateShort } from "@/types/incident";
function AlertsDesktop(){const[data,setData]=useState<SiraIncident[]>([]);const[loading,setLoading]=useState(true);async function load(){setLoading(true);try{setData(await listIncidents())}finally{setLoading(false)}}useEffect(()=>{load()},[]);const alerts=useMemo(()=>data.filter(x=>x.status!=="resolved"),[data]);return <><PageHeader title="Fiber Risk Alerts" subtitle="Open and work-in-progress incidents requiring attention" actions={<button className="btn" onClick={load}>Refresh</button>}/>{loading?<div className="card empty">Loading alerts...</div>:alerts.length===0?<div className="card empty"><div style={{fontSize:34}}>OK</div><b>No active Fiber Risk alerts</b><div>All recorded incidents are resolved.</div></div>:<div className="stack">{alerts.map(i=><Link href={`/incident/${i.id}`} key={i.id} className="incident-card"><div><div className="pill-row"><span className={`badge ${i.severity}`}>{String(i.severity).toUpperCase()}</span><span className={`badge ${i.status}`}>{i.status==="in_progress"?"Work in Progress":"Open"}</span></div><h3>{i.title}</h3><p>{i.address_text||i.city||"Map selected location"} - {formatDateShort(i.created_at)}</p></div><div style={{alignSelf:"center",color:"#1267e8",fontWeight:900}}>Open</div></Link>)}</div>}</>}


// Phones get the SIRA Android app layout; desktop keeps the page above unchanged.
export default function Alerts() {
  const isMobile = useIsMobile();
  if (isMobile === null) return null;
  return isMobile ? <MobileAlerts /> : <AlertsDesktop />;
}
