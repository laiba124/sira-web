"use client";
import { useIsMobile } from "@/lib/useIsMobile";
import { MobileLogin } from "@/components/mobile/screens/MobileAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import HCaptcha, { CAPTCHA_SITE_KEY, type HCaptchaHandle } from "@/components/HCaptcha";
import { supabase } from "@/lib/supabase";

const LOCK_KEY="sira-web-login-lock";
function AuthPageDesktop(){
 const router=useRouter(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [captchaToken,setCaptchaToken]=useState<string|null>(null); const captchaRef=useRef<HCaptchaHandle>(null);
 async function login(e:React.FormEvent){e.preventDefault();setMessage(""); const now=Date.now(); let lock={attempts:0,lockedUntil:0}; try{lock=JSON.parse(localStorage.getItem(LOCK_KEY)||"{}") as any}catch{}; if(lock.lockedUntil>now){setMessage(`Too many failed attempts. Try again in ${Math.ceil((lock.lockedUntil-now)/60000)} minute(s).`);return;} if(CAPTCHA_SITE_KEY&&!captchaToken){setMessage("Complete the security check.");return;} setBusy(true); const {error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password,options:captchaToken?{captchaToken}:undefined}); setBusy(false);
  // Each token is single use, so a new check is needed for the next attempt.
  if(CAPTCHA_SITE_KEY) captchaRef.current?.reset();
  if(error){
   // Not a wrong password, so these do not count towards the lockout.
   if(error.code==="captcha_failed"){setMessage("Security check failed. Please try again.");return;}
   if(error.status===429){setMessage("Too many login attempts. Please wait a few minutes and try again.");return;}
   const attempts=(lock.attempts||0)+1; const lockedUntil=attempts>=5?Date.now()+15*60*1000:0; localStorage.setItem(LOCK_KEY,JSON.stringify({attempts,lockedUntil})); setMessage(lockedUntil?"Login temporarily locked for 15 minutes.":`Invalid email or password. ${5-attempts} attempt(s) remaining.`);return;}
  localStorage.removeItem(LOCK_KEY); router.replace("/incidents");}
 return <div className="auth-page"><div className="auth-visual"><div className="auth-brand"><h1>SIRA</h1><p>Secure field incident monitoring, workflow tracking and geospatial reporting.</p></div></div><div className="auth-form-wrap"><form className="auth-form" onSubmit={login}><img className="auth-logo" src="/sira-icon.png" alt="SIRA"/><h2>Secure Login</h2><p>Use your registered email address and password.</p>{message&&<div className="notice error" style={{marginBottom:14}}>{message}</div>}<div className="field"><label>Email address</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></div><div className="field"><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></div>{CAPTCHA_SITE_KEY&&<HCaptcha ref={captchaRef} onToken={setCaptchaToken} onError={setMessage}/>}<button className="btn primary" style={{width:"100%",marginTop:8}} disabled={busy||(!!CAPTCHA_SITE_KEY&&!captchaToken)}>{busy?"Signing in...":"Sign in"}</button><p className="small" style={{textAlign:"center",marginTop:18}}>Need an account? <Link href="/signup" style={{color:"#1267e8",fontWeight:900}}>Create account</Link></p></form></div></div>;
}


// Phones get the SIRA Android app layout; desktop keeps the page above unchanged.
export default function AuthPage() {
  const isMobile = useIsMobile();
  if (isMobile === null) return null;
  return isMobile ? <MobileLogin /> : <AuthPageDesktop />;
}
