import { useState, useEffect, useRef, useCallback } from "react";

const APP = "Rooster";
const TAGLINE = "JAMB UTME Exam Simulator";
const VERSION = "2.2.5";
const UPDATE_CHECK_URL = "https://raw.githubusercontent.com/zibvh/roost/main/public/version.json";
const GITHUB_REPO = "zibvh/roost";
const JAMB_DATE = new Date("2026-04-18T00:00:00"); // ← update this when JAMB date changes
const UKEY = "rooster_user"; // stores name + reminder time
const UTME_SECS = 105 * 60;
const MARKS_TOTAL = 400;
const SKEY = "rooster_v2";
const YEARS = Array.from({length:16},(_,i)=>2010+i);

// Subject colours
const SC = {
  "Use of English":   "#a855f7",
  "Mathematics":      "#06b6d4",
  "Biology":          "#22c55e",
  "Physics":          "var(--accent)",
  "Chemistry":        "#f59e0b",
  "Economics":        "#f97316",
  "Government":       "#ec4899",
  "Literature":       "#8b5cf6",
  "Geography":        "#14b8a6",
  "CRS":              "#eab308",
  "IRS":              "#84cc16",
  "Agricultural Science": "#10b981",
  "Commerce":         "#fb923c",
  "Accounting":       "#60a5fa",
};

// Cluster definitions
const CLUSTERS = {
  Science:     ["Use of English","Mathematics","Biology","Physics","Chemistry","Agricultural Science"],
  "Commercial":["Use of English","Mathematics","Economics","Commerce","Accounting","Government"],
  Arts:        ["Use of English","Literature","Government","Economics","Geography","CRS","IRS"],
};

const ALL_SUBJECTS = Object.keys(SC);


// QB is lazy-loaded in App component via import('./questionBank.js')


// ─── STORAGE ──────────────────────────────────────────────────────────────────
const initStore = () => ({ sessions:[], subjectStats:{}, topicStats:{}, totalQ:0, totalC:0 });

// Dual-layer storage: Capacitor Preferences (native, survives reinstalls) + localStorage fallback
const CAP_AVAIL = typeof window!=='undefined' && window.Capacitor && window.Capacitor.isPluginAvailable && window.Capacitor.isPluginAvailable('Preferences');

async function capGet(key){
  if(!CAP_AVAIL) return null;
  try{
    const {Preferences} = await import('@capacitor/preferences');
    const {value} = await Preferences.get({key});
    return value;
  }catch(e){ return null; }
}
async function capSet(key,value){
  if(!CAP_AVAIL) return;
  try{
    const {Preferences} = await import('@capacitor/preferences');
    await Preferences.set({key,value});
  }catch(e){}
}
async function capRemove(key){
  if(!CAP_AVAIL) return;
  try{
    const {Preferences} = await import('@capacitor/preferences');
    await Preferences.remove({key});
  }catch(e){}
}

async function loadStore(){
  try{
    // Try native Preferences first (survives APK reinstalls)
    const native = await capGet(SKEY);
    if(native) return JSON.parse(native);
    // Fall back to localStorage (web/PWA)
    const s=localStorage.getItem(SKEY);
    if(s){
      const parsed=JSON.parse(s);
      // Migrate to native storage
      await capSet(SKEY,s);
      return parsed;
    }
    return initStore();
  }
  catch(e){ return initStore(); }
}
async function saveStore(s){
  try{
    const json=JSON.stringify(s);
    await capSet(SKEY,json);          // native (primary)
    localStorage.setItem(SKEY,json);  // localStorage (backup/web)
    return true;
  }
  catch(e){ return false; }
}
async function clearStore(){
  try{
    await capRemove(SKEY);
    localStorage.removeItem(SKEY);
  }catch(e){}
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
async function loadUser(){
  try{
    const raw=await capGet(UKEY) || localStorage.getItem(UKEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return null; // null = not onboarded yet
}

async function saveUser(u){
  try{
    const json=JSON.stringify(u);
    await capSet(UKEY,json);
    localStorage.setItem(UKEY,json);
  }catch(e){}
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const NOTIF_MESSAGES = [
  // Motivational
  n=>`${n}, JAMB is almost here. Don't let your mates beat you 💪`,
  n=>`${n}, one practice session today can change your JAMB score. Open Rooster 📖`,
  n=>`${n}, the students who pass JAMB practised every day. Will you? 🎯`,
  n=>`${n}, you're closer to your dream course than you think. Keep pushing! 🔥`,
  n=>`${n}, JAMB won't respect feelings. Respect your preparation 💀`,
  // Roasting
  n=>`${n} you've been on your phone for hours but not on Rooster 😭`,
  n=>`${n}, your coursemates are practising right now. Just saying 👀`,
  n=>`${n} imagine failing JAMB because of one subject you ignored 😬`,
  n=>`${n}, TikTok won't get you into university. Rooster will 😅`,
  n=>`${n} your future self is begging you to open Rooster right now 🥺`,
  // Tips
  n=>`Tip for ${n}: In Use of English, always eliminate 2 wrong options first ✏️`,
  n=>`Tip for ${n}: Read the question twice before picking an answer. Don't rush! ⏱️`,
  n=>`Tip for ${n}: Weak in Maths? Practise past questions from 2015–2020 first 📊`,
  n=>`Tip for ${n}: JAMB loves repetition — some questions repeat across years 🔁`,
  n=>`Tip for ${n}: Chemistry Gas Laws show up almost every year. Know them! 🧪`,
];

const DAILY_REMINDER = n=>`${n}, you haven't practised today 😭 Open Rooster!`;

async function scheduleNotifications(userName, reminderHour, reminderMinute){
  try{
    if(!window.Capacitor?.isNativePlatform?.()) return;
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    // Cancel all existing
    const pending = await LocalNotifications.getPending();
    if(pending.notifications.length){
      await LocalNotifications.cancel({notifications: pending.notifications});
    }

    const now = new Date();
    const notifications = [];

    // Daily reminder
    const reminderTime = new Date();
    reminderTime.setHours(reminderHour, reminderMinute, 0, 0);
    if(reminderTime <= now) reminderTime.setDate(reminderTime.getDate()+1);

    notifications.push({
      id: 1,
      title: "Rooster 🐓",
      body: DAILY_REMINDER(userName),
      schedule: {
        at: reminderTime,
        repeats: true,
        every: "day",
      },
      sound: null,
      smallIcon: "ic_launcher",
    });

    // 4 random notifications spread over next 7 days
    const usedSlots = new Set();
    for(let i=0; i<4; i++){
      let dayOffset, hour;
      do{
        dayOffset = 1 + Math.floor(Math.random()*7);
        hour = 8 + Math.floor(Math.random()*14); // between 8am and 10pm
      } while(usedSlots.has(`${dayOffset}-${hour}`));
      usedSlots.add(`${dayOffset}-${hour}`);

      const t = new Date();
      t.setDate(t.getDate()+dayOffset);
      t.setHours(hour, Math.floor(Math.random()*60), 0, 0);

      const msgFn = NOTIF_MESSAGES[Math.floor(Math.random()*NOTIF_MESSAGES.length)];
      notifications.push({
        id: 10+i,
        title: "Rooster 🐓",
        body: msgFn(userName),
        schedule: { at: t },
        sound: null,
        smallIcon: "ic_launcher",
      });
    }

    await LocalNotifications.schedule({ notifications });
  }catch(e){ console.warn("scheduleNotifications error:", e); }
}



async function recordSession(session){
  const s=await loadStore();
  s.sessions=[session,...s.sessions].slice(0,100);
  s.totalQ+=session.total; s.totalC+=session.correct;
  Object.entries(session.bySubject).forEach(([sub,d])=>{
    if(!s.subjectStats[sub]) s.subjectStats[sub]={correct:0,total:0,sessions:0};
    s.subjectStats[sub].correct+=d.correct;
    s.subjectStats[sub].total+=d.total;
    s.subjectStats[sub].sessions+=1;
  });
  session.topicResults.forEach(t=>{
    const k=`${t.subject}__${t.topic}`;
    if(!s.topicStats[k]) s.topicStats[k]={subject:t.subject,topic:t.topic,correct:0,total:0};
    s.topicStats[k].correct+=t.correct;
    s.topicStats[k].total+=t.total;
  });
  await saveStore(s); return s;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
function fmtDate(iso){ try{return new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}catch{return "";} }
function fmtSecs(s){ const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; if(h>0)return`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; }
function getScore(correct,total){ return total?Math.round((correct/total)*400):0; }
function pct(correct,total){ return total?Math.round(correct/total*100):0; }

function subjectCount(sub){ return sub==="Use of English"?60:40; }

function buildExam(mode,cfg,bank){
  if(mode==="subject"){
    let p=[...bank].filter(q=>q.s===cfg.subject);
    const maxQ=subjectCount(cfg.subject);
    return shuffle(p).slice(0,Math.min(cfg.count||maxQ,maxQ));
  }
  if(mode==="mixed"){
    const subs=cfg.subjects||["Use of English","Biology","Chemistry","Physics"];
    let out=[];
    subs.forEach(sub=>{
      const perSub=cfg.perSubject?.[sub]||subjectCount(sub);
      let pool=[...bank].filter(q=>q.s===sub);
      if(cfg.year) pool=pool.filter(q=>q.y===cfg.year);
      out=out.concat(shuffle(pool).slice(0,perSub));
    });
    return out;
  }
  return [];
}

function topicResults(questions,answers){
  const m={};
  questions.forEach(q=>{
    const k=`${q.s}__${q.t}`;
    if(!m[k]) m[k]={subject:q.s,topic:q.t,correct:0,total:0};
    m[k].total++;
    if(answers[q.id]===q.a) m[k].correct++;
  });
  return Object.values(m);
}

// ─── TIMER ────────────────────────────────────────────────────────────────────
function useTimer(init,onExpire){
  const [secs,setSecs]=useState(init);
  const runRef=useRef(false);
  const ivRef=useRef(null);
  const stop=useCallback(()=>{ runRef.current=false; clearInterval(ivRef.current); },[]);
  const start=useCallback(()=>{
    if(runRef.current) return;
    runRef.current=true;
    ivRef.current=setInterval(()=>{
      setSecs(s=>{ if(s<=1){stop();onExpire?.();return 0;} return s-1; });
    },1000);
  },[stop]);
  const reset=useCallback(t=>{ stop(); setSecs(t); },[stop]);
  useEffect(()=>()=>clearInterval(ivRef.current),[]);
  return {secs,start,stop,reset,fmt:()=>fmtSecs(secs)};
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
function I({n,sz=20,c="currentColor"}){
  const p={width:sz,height:sz,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"};
  const icons={
    home:<svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    book:<svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    chart:<svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    cog:<svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    clock:<svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    flag:<svg {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    check:<svg {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x:<svg {...p} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    left:<svg {...p} strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    right:<svg {...p} strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    grid:<svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    play:<svg width={sz} height={sz} viewBox="0 0 24 24" fill={c}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    trash:<svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
    sun:<svg {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon:<svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    download:<svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  };
  return icons[n]||null;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  --bg:#1a1714;--bg2:#201d1a;--bg3:#272320;--bg4:#2f2b27;
  --accent:#da7756;--accent2:#bd5f3e;--accent-glow:rgba(218,119,86,0.3);
  --green:#7fb77e;--amber:#e8a87c;--red:#c9614a;
  --text:#ede8e3;--text2:#b3a69c;--text3:#7c6e63;
  --border:#2a2622;--border2:#3e3731;
  --r:16px;--r2:12px;--r3:8px;
  --font:'Poppins',sans-serif;--mono:'JetBrains Mono',monospace;
  --cbg:#201d1a;--cbo:#2f2b27;--obg:#201d1a;--obo:#3e3731;
  --navbg:rgba(26,23,20,0.97);
}
body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#201d1a;}
::-webkit-scrollbar-thumb{background:#da7756;border-radius:10px;}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);display:flex;flex-direction:column;position:relative;}
.screen{flex:1;padding:24px 16px 96px;overflow-y:auto;}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--navbg);backdrop-filter:blur(20px);border-top:1px solid var(--border2);display:flex;justify-content:space-around;padding:10px 0 20px;z-index:100;}
.nb{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:var(--text3);cursor:pointer;transition:color .15s;padding:4px 18px;}
.nb.on{color:var(--accent);}
.nb span{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;}
.card{background:var(--cbg);border:1px solid var(--cbo);border-radius:var(--r);padding:16px;}
.card-acc{background:linear-gradient(135deg,rgba(218,119,86,.08),rgba(189,95,62,.04));border:1px solid rgba(218,119,86,.25);border-radius:var(--r);padding:18px;}
.update-banner{background:linear-gradient(135deg,rgba(127,183,126,.1),rgba(218,119,86,.07));border:1px solid rgba(127,183,126,.28);border-radius:var(--r2);padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 20px;border-radius:var(--r2);border:none;font-family:var(--font);font-weight:600;font-size:15px;cursor:pointer;transition:all .12s;width:100%;}
.btn:disabled{opacity:.35;cursor:not-allowed;}
.bp{background:linear-gradient(105deg,#da7756,#bd5f3e);color:#1a1714;border:1px solid rgba(255,215,190,.4);box-shadow:0 6px 18px -4px var(--accent-glow);}
.bp:active:not(:disabled){background:linear-gradient(105deg,#c96845,#a84f30);transform:scale(.98);}
.bg{background:transparent;color:var(--text2);border:1px solid var(--border2);}
.bg:active{background:var(--bg3);}
.bd{background:rgba(201,97,74,.1);color:var(--red);border:1px solid rgba(201,97,74,.22);}
.bsm{padding:8px 14px;font-size:13px;border-radius:var(--r3);width:auto;}
.bdg{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700;}
.deasy{background:rgba(127,183,126,.12);color:var(--green);}
.dmed{background:rgba(232,168,124,.12);color:var(--amber);}
.dhard{background:rgba(201,97,74,.12);color:var(--red);}
.bok{background:rgba(127,183,126,.12);color:var(--green);}
.bfail{background:rgba(201,97,74,.12);color:var(--red);}
.prog{height:4px;border-radius:999px;background:var(--bg4);overflow:hidden;}
.pf{height:100%;border-radius:999px;transition:width .3s;}
.tmr{display:inline-flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border2);border-radius:999px;padding:6px 14px;font-family:var(--mono);font-weight:700;font-size:14px;}
.tw{border-color:rgba(232,168,124,.4);color:var(--amber);}
.tc{border-color:rgba(201,97,74,.4);color:var(--red);animation:pulse 1s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.opt{display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:var(--r2);border:1.5px solid var(--obo);background:var(--obg);cursor:pointer;transition:all .12s;margin-bottom:10px;}
.opt:active{transform:scale(.99);}
.osel{border-color:var(--accent)!important;background:rgba(218,119,86,.07)!important;}
.ocor{border-color:var(--green)!important;background:rgba(127,183,126,.07)!important;}
.owrng{border-color:var(--red)!important;background:rgba(201,97,74,.07)!important;}
.okey{width:28px;height:28px;border-radius:50%;border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;color:var(--text2);transition:all .12s;}
.osel .okey{border-color:var(--accent);background:var(--accent);color:#1a1714;}
.ocor .okey{border-color:var(--green);background:var(--green);color:#1a1714;}
.owrng .okey{border-color:var(--red);background:var(--red);color:#fff;}
.pg{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin:10px 0;}
.pb{aspect-ratio:1;border-radius:6px;border:none;font-size:11px;font-weight:700;cursor:pointer;transition:all .1s;background:var(--bg3);color:var(--text3);}
.pb.pa{background:rgba(218,119,86,.2);color:var(--accent);}
.pb.pf2{background:rgba(232,168,124,.18);color:var(--amber);}
.pb.pc{outline:2px solid var(--accent);outline-offset:1px;color:var(--text);}
.chip{background:var(--bg3);border:1px solid var(--border2);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600;color:var(--text2);cursor:pointer;transition:all .12s;white-space:nowrap;}
.chip.on{background:var(--accent);color:#1a1714;border-color:var(--accent);box-shadow:0 2px 8px var(--accent-glow);}
.chip:active{transform:scale(.95);}
.tabs{display:flex;background:var(--bg3);border-radius:var(--r2);padding:4px;gap:4px;margin-bottom:20px;}
.tab{flex:1;padding:10px 4px;border:none;background:none;color:var(--text3);font-family:var(--font);font-size:13px;font-weight:600;border-radius:var(--r3);cursor:pointer;transition:all .18s;}
.tab.on{background:var(--cbg);color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,.25);}
.expl{background:rgba(218,119,86,.05);border:1px solid rgba(218,119,86,.18);border-radius:var(--r2);padding:14px;margin-top:12px;}
.yp{padding:7px 13px;border-radius:var(--r3);border:none;background:var(--bg3);color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
.yp.on{background:var(--accent);color:#1a1714;box-shadow:0 2px 8px var(--accent-glow);}
.yp:active{opacity:.85;}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.sc{border-radius:var(--r);padding:16px;cursor:pointer;border:2px solid transparent;transition:all .15s;}
.sc:active{transform:scale(.97);}
.sc.on{transform:scale(.98);}
.mc{background:var(--cbg);border:1px solid var(--cbo);border-radius:var(--r);padding:16px;cursor:pointer;transition:background .12s;display:flex;align-items:center;gap:14px;margin-bottom:10px;}
.mc:active{background:var(--bg3);}
.sub-break{border-radius:var(--r2);padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;}
.overlay{position:absolute;inset:0;background:rgba(26,23,20,.95);z-index:200;display:flex;flex-direction:column;padding:20px;overflow-y:auto;}
.lbl{font-size:11px;font-weight:700;letter-spacing:.8px;color:var(--text3);text-transform:uppercase;margin-bottom:10px;}
.row{display:flex;justify-content:space-between;align-items:center;}
.empty{text-align:center;padding:56px 24px;color:var(--text3);}
.empty p{margin-top:10px;font-size:14px;line-height:1.7;}
.tgl{width:46px;height:24px;border-radius:999px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
.tgl.on{background:var(--accent);}
.tgl.off{background:var(--border2);}
.tgl-dot{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;}
.tgl.on .tgl-dot{left:25px;}
.tgl.off .tgl-dot{left:3px;}
.footer{text-align:center;padding:16px 16px 8px;font-size:11px;color:var(--text3);font-weight:600;letter-spacing:.3px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fade{animation:fadeUp .22s ease forwards;}
@keyframes landIn{from{opacity:0;transform:scale(.94) translateY(24px)}to{opacity:1;transform:none}}
.land{animation:landIn .5s cubic-bezier(.22,1,.36,1) forwards;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:var(--accent);border-radius:999px;}`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("landing");
  const [tab,setTab]=useState("home");

  const [store,setStore]=useState(null);
  const [loaded,setLoaded]=useState(false);
  const [user,setUser]=useState(null); // {name, reminderHour, reminderMinute}
  const [questions,setQuestions]=useState([]);
  const [currentQ,setCurrentQ]=useState(0);
  const [answers,setAnswers]=useState({});
  const [flagged,setFlagged]=useState(new Set());
  const [revealed,setRevealed]=useState({});
  const [examCfg,setExamCfg]=useState({});
  const [result,setResult]=useState(null);
  const [showPal,setShowPal]=useState(false);
  const [showConf,setShowConf]=useState(false);
  const [update,setUpdate]=useState(null);

  useEffect(()=>{
    Promise.all([loadStore(), loadUser()]).then(([s,u])=>{
      setStore(s);
      setUser(u);
      setLoaded(true);
      // Reschedule notifications daily
      if(u) scheduleNotifications(u.name, u.reminderHour, u.reminderMinute);
    });
  },[]);

  // Lazy-load question bank so it doesn't block app startup
  const [QB,setQB]=useState([]);
  useEffect(()=>{
    import('./questionBank.js').then(mod=>setQB(mod.QB));
  },[]);

  async function handleOnboard(u){
    await saveUser(u);
    setUser(u);
    await scheduleNotifications(u.name, u.reminderHour, u.reminderMinute);
    setScreen("home");
  }

  const timer=useTimer(105*60,()=>doSubmit(true));

  function goTab(t){
    setTab(t);
    setScreen({home:"home",practice:"select",stats:"stats",settings:"settings"}[t]||"home");
  }

  function startExam(cfg){
    const qs=buildExam(cfg.mode,cfg,QB);
    if(!qs.length) return;
    setQuestions(qs); setCurrentQ(0); setAnswers({}); setFlagged(new Set()); setRevealed({});
    setResult(null); setExamCfg(cfg);
    const dur=cfg.mode==="mixed"?105*60:Math.max(qs.length*90,600);
    timer.reset(dur); setScreen("exam"); setTimeout(()=>timer.start(),80);
  }

  async function doSubmit(auto=false){
    timer.stop(); setShowConf(false);
    const correct=questions.filter(q=>answers[q.id]===q.a).length;
    const bySubject={};
    questions.forEach(q=>{
      if(!bySubject[q.s]) bySubject[q.s]={correct:0,total:0};
      bySubject[q.s].total++;
      if(answers[q.id]===q.a) bySubject[q.s].correct++;
    });
    const tr=topicResults(questions,answers);
    const session={id:Date.now(),date:new Date().toISOString(),mode:examCfg.mode,
      subject:examCfg.subject,year:examCfg.year,subjects:examCfg.subjects,
      correct,total:questions.length,score:getScore(correct,questions.length),
      pct:pct(correct,questions.length),bySubject,topicResults:tr,auto};
    setResult({correct,total:questions.length,bySubject,score:session.score,pct:session.pct});
    const updated=await recordSession(session);
    setStore(updated); setScreen("result");
  }

  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        {screen==="landing"  && (
          loaded
            ? (user
                ? <Landing onStart={()=>setScreen("home")}/>
                : <OnboardingScreen onDone={handleOnboard}/>)
            : <Landing onStart={()=>setScreen("home")}/>
        )}
        {screen==="home"     && <HomeScreen store={store} loaded={loaded} setScreen={setScreen} update={update} user={user}/>}
        {screen==="select"   && <SelectScreen startExam={startExam} setScreen={setScreen}/>}
        {screen==="exam"     && questions.length>0 && (
          <ExamScreen questions={questions} currentQ={currentQ} setCurrentQ={setCurrentQ}
            answers={answers} setAnswers={setAnswers} flagged={flagged} setFlagged={setFlagged}
            revealed={revealed} setRevealed={setRevealed} examCfg={examCfg} timer={timer}
            showPal={showPal} setShowPal={setShowPal} showConf={showConf} setShowConf={setShowConf}
            onSubmit={doSubmit}/>
        )}
        {screen==="result"   && result && (
          <ResultScreen stats={result} questions={questions} answers={answers} setScreen={setScreen} user={user}/>
        )}
        {screen==="review"   && <ReviewScreen questions={questions} answers={answers} setScreen={setScreen}/>}
        {screen==="stats"    && <StatsScreen store={store} loaded={loaded}/>}
        {screen==="settings" && <SettingsScreen store={store} setStore={setStore} user={user} setUser={setUser}/>}

        {screen!=="exam" && screen!=="landing" && (
          <nav className="nav">
            {[{id:"home",n:"home",l:"Home"},{id:"practice",n:"book",l:"Practice"},
              {id:"stats",n:"chart",l:"Stats"},{id:"settings",n:"cog",l:"Settings"}].map(x=>(
              <button key={x.id} className={`nb ${tab===x.id?"on":""}`} onClick={()=>goTab(x.id)}>
                <I n={x.n} sz={20}/><span>{x.l}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function OnboardingScreen({onDone}){
  const [name,setName]=useState("");
  const [hour,setHour]=useState(18);
  const [minute,setMinute]=useState(0);
  const [step,setStep]=useState(0); // 0=name, 1=reminder

  function handleNameNext(){
    if(!name.trim()) return;
    setStep(1);
  }

  function handleFinish(){
    onDone({name:name.trim(), reminderHour:hour, reminderMinute:minute});
  }

  const fmt12=h=>{
    const ampm=h>=12?"PM":"AM";
    const h12=h%12||12;
    return `${h12}:${String(minute).padStart(2,"0")} ${ampm}`;
  };

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:"100vh",padding:"32px 24px",background:"var(--bg)"}}>

      <img src="/icon-192.png" alt="Rooster" style={{width:72,height:72,borderRadius:20,
        marginBottom:24,boxShadow:"0 8px 32px rgba(218,119,86,.3)"}}/>

      <div style={{fontSize:36,fontWeight:900,letterSpacing:-1,marginBottom:6,
        background:"linear-gradient(135deg,var(--text) 40%,var(--accent))",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
        Rooster
      </div>

      {step===0 && (
        <div style={{width:"100%",maxWidth:360,marginTop:32}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:6,textAlign:"center"}}>Hey! What's your name? 👋</div>
          <div style={{fontSize:14,color:"var(--text3)",textAlign:"center",marginBottom:28}}>
            We'll use it to personalise your experience
          </div>
          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleNameNext()}
            placeholder="Enter your name"
            autoFocus
            style={{width:"100%",padding:"14px 16px",borderRadius:"var(--r2)",
              border:"2px solid var(--border2)",background:"var(--bg3)",
              color:"var(--text)",fontSize:16,fontWeight:600,outline:"none",
              boxSizing:"border-box",marginBottom:16,
              fontFamily:"var(--sans)"}}
          />
          <button className="btn bp" style={{width:"100%",borderRadius:999,fontSize:16,padding:"14px"}}
            onClick={handleNameNext} disabled={!name.trim()}>
            Continue →
          </button>
        </div>
      )}

      {step===1 && (
        <div style={{width:"100%",maxWidth:360,marginTop:32}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:6,textAlign:"center"}}>
            When should we remind you? ⏰
          </div>
          <div style={{fontSize:14,color:"var(--text3)",textAlign:"center",marginBottom:28}}>
            We'll nudge you daily to practise, {name.trim()} 😊
          </div>

          <div className="card" style={{marginBottom:20,textAlign:"center"}}>
            <div style={{fontSize:40,fontWeight:900,fontFamily:"var(--mono)",
              color:"var(--accent)",marginBottom:12}}>{fmt12(hour)}</div>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              {[7,9,12,15,18,20,21].map(h=>(
                <button key={h} onClick={()=>setHour(h)}
                  className={`btn ${hour===h?"bp":"bg"}`}
                  style={{padding:"8px 14px",fontSize:13,borderRadius:999,minWidth:60}}>
                  {h===7?"7 AM":h===9?"9 AM":h===12?"12 PM":h===15?"3 PM":h===18?"6 PM":h===20?"8 PM":"9 PM"}
                </button>
              ))}
            </div>
          </div>

          <button className="btn bp" style={{width:"100%",borderRadius:999,fontSize:16,padding:"14px"}}
            onClick={handleFinish}>
            <I n="check" sz={16} c="#fff"/> Let's Go!
          </button>
        </div>
      )}
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({onStart}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:"100vh",padding:"32px 24px",textAlign:"center",background:"var(--bg)"}}>
      <div className="land" style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
        <img src="/icon-192.png" alt="Rooster" style={{width:80,height:80,borderRadius:24,marginBottom:28,boxShadow:"0 8px 32px rgba(218,119,86,.3)"}}/>
        <div style={{fontSize:52,fontWeight:900,letterSpacing:-2,lineHeight:1,marginBottom:8,
          background:"linear-gradient(135deg,var(--text) 40%,var(--accent))",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
          Rooster
        </div>
        <div style={{fontSize:14,fontWeight:600,color:"var(--text3)",letterSpacing:.5,marginBottom:40}}>
          JAMB UTME Exam Simulator
        </div>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,marginBottom:40,maxWidth:320}}>
          {["14 Subjects","400+ Questions","2010–2025","Offline"].map(f=>(
            <span key={f} style={{padding:"6px 14px",borderRadius:999,background:"var(--bg3)",
              border:"1px solid var(--border2)",fontSize:12,fontWeight:700,color:"var(--text2)"}}>
              {f}
            </span>
          ))}
        </div>
        <button className="btn bp" style={{maxWidth:280,borderRadius:999,fontSize:16,
          padding:"16px 40px",boxShadow:"0 8px 24px rgba(218,119,86,.35)"}}
          onClick={onStart}>
          <I n="play" sz={18} c="#fff"/> Start Practising
        </button>
        <div style={{marginTop:40,fontSize:11,color:"var(--text3)",fontWeight:600}}>
          v{VERSION} · Rooster by frNtcOda
        </div>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({store,loaded,setScreen,update,user}){
  const sessions=store?.sessions||[];
  const totalQ=store?.totalQ||0;
  const totalC=store?.totalC||0;
  const avg=totalQ?pct(totalC,totalQ):null;
  const recent=sessions.slice(0,3);
  const subjStats=store?.subjectStats||{};

  // JAMB countdown
  const now=new Date();
  const msLeft=JAMB_DATE-now;
  const daysLeft=Math.max(0,Math.ceil(msLeft/(1000*60*60*24)));
  const jambPassed=msLeft<=0;

  return(
    <div className="screen fade">
      <div className="row" style={{marginBottom:22}}>
        <div>
          <div className="lbl" style={{marginBottom:3}}>JAMB UTME</div>
          <div style={{fontSize:28,fontWeight:900,letterSpacing:-1}}>
            {user?`Hey, ${user.name.split(" ")[0]} 👋`:<>Rooster <span style={{color:"var(--accent)"}}>CBT</span></>}
          </div>
        </div>
        <div style={{width:48,height:48,borderRadius:"var(--r)",background:"linear-gradient(135deg,#da7756,#bd5f3e)",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src="/icon-192.png" alt="Rooster" style={{width:40,height:40,borderRadius:12}}/>
        </div>
      </div>

      {/* JAMB Countdown */}
      {!jambPassed && (
        <div style={{marginBottom:16,borderRadius:"var(--r2)",padding:"14px 16px",
          background:"linear-gradient(135deg,rgba(218,119,86,.12),rgba(218,119,86,.04))",
          border:"1px solid rgba(218,119,86,.25)",display:"flex",alignItems:"center",gap:14}}>
          <div style={{textAlign:"center",minWidth:52}}>
            <div style={{fontSize:32,fontWeight:900,fontFamily:"var(--mono)",color:"var(--accent)",lineHeight:1}}>{daysLeft}</div>
            <div style={{fontSize:10,fontWeight:700,color:"var(--text3)",marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>days left</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800,marginBottom:2}}>JAMB UTME 2026</div>
            <div style={{fontSize:12,color:"var(--text3)",fontWeight:600}}>
              {daysLeft===0?"It's exam day! Good luck 🍀":daysLeft===1?"Tomorrow is the day! 💪":`${daysLeft} days to go. Keep practising! 🔥`}
            </div>
          </div>
        </div>
      )}

      {update && (
        <div className="update-banner">
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <I n="download" sz={15} c="var(--green)"/>
              <div style={{fontSize:13,fontWeight:800,color:"var(--green)"}}>Update available — v{update.version}</div>
            </div>
            {update.whatsNew.length>0&&(
              <div style={{marginBottom:10}}>
                {update.whatsNew.map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:3}}>
                    <div style={{width:4,height:4,borderRadius:"50%",background:"var(--accent)",marginTop:5,flexShrink:0}}/>
                    <div style={{fontSize:11,color:"var(--text2)",lineHeight:1.5}}>{item}</div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn bp bsm" style={{width:"auto",padding:"8px 18px",fontSize:12,borderRadius:999}}
              onClick={()=>{ if(typeof window!=="undefined") window.open(update.apkUrl,"_blank"); }}>
              <I n="download" sz={13} c="#1a1714"/> Download Update
            </button>
          </div>
        </div>
      )}

      <div className="card-acc" style={{marginBottom:22}}>
        {!loaded?(
          <div style={{fontSize:13,color:"var(--text3)",textAlign:"center"}}>Loading...</div>
        ):avg!==null?(
          <>
            <div className="row" style={{marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:2}}>Average Score</div>
                <div style={{fontSize:36,fontWeight:800,fontFamily:"var(--mono)",color:avg>=50?"var(--accent)":"var(--red)"}}>
                  {getScore(totalC,totalQ)}<span style={{fontSize:16,color:"var(--text3)",fontWeight:600}}>/400</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:2}}>Questions</div>
                <div style={{fontSize:28,fontWeight:800,fontFamily:"var(--mono)"}}>{totalQ}</div>
              </div>
            </div>
            <div className="prog"><div className="pf" style={{width:`${avg}%`,background:"linear-gradient(90deg,#da7756,#bd5f3e)"}}/></div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>{sessions.length} session{sessions.length!==1?"s":""} · {totalC} correct</div>
          </>
        ):(
          <div style={{fontSize:13,color:"var(--text3)",textAlign:"center",lineHeight:1.7}}>
            No sessions yet. Start practising to track your progress.
          </div>
        )}
      </div>

      <div className="lbl">Quick Start</div>
      {[
        {l:"Subjects",sub:"Pick any subject & how many questions",n:"book"},
        {l:"Mixed",sub:"Pick your 4 subjects + optional year",n:"chart"},
      ].map((m,i)=>(
        <div key={i} className="mc" onClick={()=>setScreen("select")}>
          <div style={{width:44,height:44,borderRadius:"var(--r2)",background:"var(--bg4)",
            border:"1px solid var(--border2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <I n={m.n} sz={18} c="var(--accent)"/>
          </div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{m.l}</div>
          <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{m.sub}</div></div>
          <I n="right" sz={16} c="var(--text3)"/>
        </div>
      ))}

      {recent.length>0&&(
        <>
          <div className="lbl" style={{marginTop:22}}>Recent Sessions</div>
          {recent.map(s=>(
            <div key={s.id} className="card" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:"var(--r3)",flexShrink:0,
                background:s.pct>=50?"rgba(218,119,86,.1)":"rgba(201,97,74,.08)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"var(--mono)",fontWeight:800,fontSize:13,
                color:s.pct>=50?"var(--accent)":"var(--red)"}}>
                {s.score}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {s.mode==="mixed"?`Mixed (${(s.subjects||[]).join(", ").slice(0,30)||"4 subjects"})${s.year?` · ${s.year}`:""}`:s.subject}
                </div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{s.correct}/{s.total} correct · {fmtDate(s.date)}</div>
              </div>
              <span className={`bdg ${s.pct>=50?"bok":"bfail"}`}>{s.pct>=70?"Pass":s.pct>=50?"Fair":"Fail"}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── SELECT SCREEN ────────────────────────────────────────────────────────────
function SelectScreen({startExam,setScreen}){
  const [mode,setMode]=useState("subject");
  const [subject,setSubject]=useState("Biology");
  const [count,setCount]=useState(40);
  const [selectedSubs,setSelectedSubs]=useState(["Use of English","Biology","Chemistry","Physics"]);
  const [cluster,setCluster]=useState(null);
  const [mixedYear,setMixedYear]=useState(null);

  // When subject changes, reset count to the correct default
  function pickSubject(s){
    setSubject(s);
    setCount(subjectCount(s));
  }

  function toggleSub(s){
    setSelectedSubs(prev=>{
      if(prev.includes(s)) return prev.length>1?prev.filter(x=>x!==s):prev;
      if(prev.length>=4) return [...prev.slice(1),s];
      return [...prev,s];
    });
    setCluster(null);
  }

  function pickCluster(c){
    setCluster(c);
    setSelectedSubs(CLUSTERS[c].slice(0,4));
  }

  // per-subject counts map: English=60, others=40
  const perSubMap=Object.fromEntries(selectedSubs.map(s=>[s,subjectCount(s)]));
  const totalQ=selectedSubs.reduce((acc,s)=>acc+subjectCount(s),0);
  const maxCount=subjectCount(subject);
  const countOptions=[10,20,maxCount].filter((v,i,a)=>a.indexOf(v)===i).concat(maxCount===60?[]:[]); // dedupe

  return(
    <div className="screen fade">
      <div className="row" style={{marginBottom:22}}>
        <div style={{fontSize:18,fontWeight:800}}>Configure Exam</div>
        <button className="btn bg bsm" onClick={()=>setScreen("home")}><I n="x" sz={14}/></button>
      </div>

      <div className="lbl">Mode</div>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {[{id:"subject",l:"Subjects"},{id:"mixed",l:"Mixed"}].map(m=>(
          <button key={m.id} className={`chip ${mode===m.id?"on":""}`} onClick={()=>setMode(m.id)}>{m.l}</button>
        ))}
      </div>

      {mode==="subject"&&(
        <>
          <div className="lbl">Subject</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            {ALL_SUBJECTS.map(s=>(
              <button key={s} onClick={()=>pickSubject(s)}
                style={{padding:"9px 16px",borderRadius:"var(--r2)",border:"none",
                  background:subject===s?SC[s]:"var(--bg3)",color:subject===s?"#1a1714":"var(--text2)",
                  fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .15s",
                  boxShadow:subject===s?"0 2px 10px "+SC[s]+"66":"none"}}>
                {s}
              </button>
            ))}
          </div>
          <div className="lbl">Number of Questions <span style={{color:"var(--accent)",fontWeight:800}}>max {maxCount}</span></div>
          <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            {[10,20,maxCount].map(n=><button key={n} className={`chip ${count===n?"on":""}`} onClick={()=>setCount(n)}>{n}</button>)}
          </div>
        </>
      )}

      {mode==="mixed"&&(
        <>
          <div className="lbl">Quick Cluster</div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.keys(CLUSTERS).map(c=>(
              <button key={c} className={`chip ${cluster===c?"on":""}`} onClick={()=>pickCluster(c)}>{c}</button>
            ))}
          </div>
          <div className="lbl">Your 4 Subjects <span style={{color:"var(--accent)",fontWeight:800}}>{selectedSubs.length}/4</span></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
            {ALL_SUBJECTS.map(s=>{
              const on=selectedSubs.includes(s);
              return(
                <button key={s} onClick={()=>toggleSub(s)}
                  style={{padding:"9px 16px",borderRadius:"var(--r2)",border:"none",
                    background:on?SC[s]:"var(--bg3)",color:on?"#1a1714":"var(--text2)",
                    fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .15s",
                    boxShadow:on?"0 2px 10px "+SC[s]+"66":"none"}}>
                  {s}
                </button>
              );
            })}
          </div>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:20}}>Select up to 4 · tap to toggle · max 4 auto-drops oldest</div>

          <div className="lbl">Year (optional)</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            <button className={`yp ${!mixedYear?"on":""}`} onClick={()=>setMixedYear(null)}>All Years</button>
            {YEARS.map(y=><button key={y} className={`yp ${mixedYear===y?"on":""}`} onClick={()=>setMixedYear(y)}>{y}</button>)}
          </div>

          <div className="card-acc" style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text2)",lineHeight:1.9}}>
              {selectedSubs.map(s=>`${s} (${subjectCount(s)}q)`).join(" → ")}<br/>
              Total: {totalQ} questions · 105 minutes
              {mixedYear&&<> · Year {mixedYear}</>}
            </div>
          </div>
        </>
      )}

      <button className="btn bp"
        onClick={()=>startExam({mode,subject,year:mode==="mixed"?mixedYear:null,count,subjects:selectedSubs,perSubject:perSubMap})}
        disabled={mode==="mixed"&&selectedSubs.length<2}>
        <I n="play" sz={15} c="#fff"/> Begin Exam
      </button>
    </div>
  );
}

// ─── EXAM SCREEN ──────────────────────────────────────────────────────────────
function ExamScreen({questions,currentQ,setCurrentQ,answers,setAnswers,flagged,setFlagged,
  revealed,setRevealed,examCfg,timer,showPal,setShowPal,showConf,setShowConf,onSubmit}){
  const q=questions[currentQ];
  const chosen=answers[q.id];
  const isRev=revealed[q.id];
  const isPrac=examCfg.mode!=="full";
  const tc=timer.secs<300?"tc":timer.secs<600?"tw":"";
  const answered=Object.keys(answers).length;
  const prevSubj=currentQ>0?questions[currentQ-1].s:null;
  const isNewSubj=examCfg.mode==="mixed"&&q.s!==prevSubj;
  const diffCls={Easy:"deasy",Medium:"dmed",Hard:"dhard"}[q.d]||"";

  function pick(opt){
    if(revealed[q.id]) return;
    setAnswers(a=>({...a,[q.id]:opt}));
    if(isPrac) setRevealed(r=>({...r,[q.id]:true}));
  }
  function toggleFlag(){
    setFlagged(f=>{const n=new Set(f);n.has(q.id)?n.delete(q.id):n.add(q.id);return n;});
  }

  const subjList=[...new Set(questions.map(q=>q.s))];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"var(--bg)"}}>
      {showPal&&(
        <div className="overlay">
          <div className="row" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:16}}>Question Palette</div>
            <button className="btn bg bsm" onClick={()=>setShowPal(false)}><I n="x" sz={15}/></button>
          </div>
          <div style={{display:"flex",gap:16,marginBottom:12,fontSize:11,fontWeight:700}}>
            <span style={{color:"var(--accent)"}}>Answered</span>
            <span style={{color:"var(--amber)"}}>Flagged</span>
            <span style={{color:"var(--text3)"}}>Unanswered</span>
          </div>
          {subjList.length>1?
            subjList.map(sub=>{
              const idxs=questions.reduce((acc,q_,i)=>q_.s===sub?[...acc,i]:acc,[]);
              return(
                <div key={sub} style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:SC[sub]||"var(--accent)",letterSpacing:.5,textTransform:"uppercase",marginBottom:6}}>{sub}</div>
                  <div className="pg">
                    {idxs.map(i=>(
                      <button key={i} className={`pb ${answers[questions[i].id]?"pa":""} ${flagged.has(questions[i].id)?"pf2":""} ${i===currentQ?"pc":""}`}
                        onClick={()=>{setCurrentQ(i);setShowPal(false);}}>
                        {i+1}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }):(
            <div className="pg">
              {questions.map((q_,i)=>(
                <button key={q_.id} className={`pb ${answers[q_.id]?"pa":""} ${flagged.has(q_.id)?"pf2":""} ${i===currentQ?"pc":""}`}
                  onClick={()=>{setCurrentQ(i);setShowPal(false);}}>
                  {i+1}
                </button>
              ))}
            </div>
          )}
          <div style={{marginTop:"auto",paddingTop:16}}>
            <div className="row" style={{marginBottom:14,fontSize:12,color:"var(--text3)",fontWeight:600}}>
              <span>Answered: <strong style={{color:"var(--text)"}}>{answered}</strong></span>
              <span>Flagged: <strong style={{color:"var(--text)"}}>{flagged.size}</strong></span>
              <span>Left: <strong style={{color:"var(--text)"}}>{questions.length-answered}</strong></span>
            </div>
            <button className="btn bd" onClick={()=>{setShowPal(false);setShowConf(true);}}>Submit Exam</button>
          </div>
        </div>
      )}

      {showConf&&(
        <div className="overlay" style={{justifyContent:"center",alignItems:"center"}}>
          <div className="card" style={{width:"100%"}}>
            <div style={{fontWeight:700,fontSize:17,marginBottom:10}}>Submit Examination?</div>
            <div style={{color:"var(--text2)",fontSize:14,lineHeight:1.7,marginBottom:6}}>
              You have answered <strong>{answered}</strong> of <strong>{questions.length}</strong> questions.
            </div>
            {questions.length-answered>0&&(
              <div style={{fontSize:13,color:"var(--amber)",marginBottom:14}}>
                {questions.length-answered} question{questions.length-answered>1?"s":""} unanswered.
              </div>
            )}
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button className="btn bg" onClick={()=>setShowConf(false)}>Cancel</button>
              <button className="btn bp" onClick={()=>onSubmit(false)}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <div style={{padding:"14px 16px 12px",borderBottom:"1px solid var(--border)"}}>
        <div className="row" style={{marginBottom:10}}>
          <div className={`tmr ${tc}`}><I n="clock" sz={13}/> {timer.fmt()}</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn bg bsm" onClick={toggleFlag}>
              <I n="flag" sz={14} c={flagged.has(q.id)?"var(--amber)":"currentColor"}/>
            </button>
            <button className="btn bg bsm" onClick={()=>setShowPal(true)}><I n="grid" sz={14}/></button>
          </div>
        </div>
        <div className="row" style={{marginBottom:8}}>
          <div className="prog" style={{flex:1,marginRight:10}}>
            <div className="pf" style={{width:`${((currentQ+1)/questions.length)*100}%`,background:"var(--accent)"}}/>
          </div>
          <div style={{fontSize:12,fontWeight:700,fontFamily:"var(--mono)",color:"var(--text2)",whiteSpace:"nowrap"}}>
            {currentQ+1} / {questions.length}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:999,color:SC[q.s]||"var(--accent)",background:(SC[q.s]||"var(--accent)")+"14"}}>{q.s}</span>
          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,color:"var(--text3)",background:"var(--bg3)"}}>{q.t}</span>
          <span className={`bdg ${diffCls}`}>{q.d}</span>
          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,color:"var(--text3)",background:"var(--bg3)",fontFamily:"var(--mono)"}}>{q.y}</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 0"}}>
        {isNewSubj&&(
          <div className="sub-break" style={{background:(SC[q.s]||"var(--accent)")+"12",border:`1px solid ${SC[q.s]||"var(--accent)"}30`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:SC[q.s]||"var(--accent)",flexShrink:0}}/>
            <div>
              <div style={{fontSize:10,color:"var(--text3)",fontWeight:600}}>Now starting</div>
              <div style={{fontSize:14,fontWeight:700,color:SC[q.s]||"var(--accent)"}}>{q.s}</div>
            </div>
          </div>
        )}
        <div className="card fade" style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",fontFamily:"var(--mono)",marginBottom:8,letterSpacing:.4}}>
            QUESTION {currentQ+1}
          </div>
          <div style={{fontSize:15,fontWeight:500,lineHeight:1.8}}>{q.q}</div>
        </div>

        {Object.entries(q.o).map(([key,val])=>{
          let cls="";
          if(isRev){
            if(key===q.a) cls="ocor";
            else if(key===chosen&&chosen!==q.a) cls="owrng";
          } else if(chosen===key) cls="osel";
          return(
            <div key={key} className={`opt ${cls}`} onClick={()=>pick(key)}>
              <div className="okey">{key}</div>
              <div style={{fontSize:14,lineHeight:1.7,fontWeight:500,flex:1}}>{val}</div>
              {isRev&&key===q.a&&<div style={{marginLeft:"auto",flexShrink:0}}><I n="check" sz={16} c="var(--green)"/></div>}
              {isRev&&cls==="owrng"&&<div style={{marginLeft:"auto",flexShrink:0}}><I n="x" sz={16} c="var(--red)"/></div>}
            </div>
          );
        })}

        {isRev&&(
          <div className="expl fade">
            <div style={{fontSize:11,fontWeight:700,color:"var(--accent)",marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Explanation</div>
            <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.8}}>{q.e}</div>
          </div>
        )}
        <div style={{height:16}}/>
      </div>

      <div style={{padding:"12px 16px 26px",borderTop:"1px solid var(--border)"}}>
        <div style={{display:"flex",gap:10}}>
          <button className="btn bg" style={{flex:1}} onClick={()=>setCurrentQ(c=>Math.max(0,c-1))} disabled={currentQ===0}>
            <I n="left" sz={15}/> Prev
          </button>
          {currentQ<questions.length-1?(
            <button className="btn bp" style={{flex:1}} onClick={()=>setCurrentQ(c=>c+1)}>
              Next <I n="right" sz={15} c="#fff"/>
            </button>
          ):(
            <button className="btn bd" style={{flex:1}} onClick={()=>setShowConf(true)}>Submit</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────
function ResultScreen({stats,questions,answers,setScreen,user}){
  const {correct,total,bySubject,score,pct:p}=stats;
  const grade=p>=70?"Excellent":p>=50?"Good":p>=40?"Fair":"Needs Work";
  const gc=p>=70?"var(--green)":p>=50?"var(--accent)":p>=40?"var(--amber)":"var(--red)";
  const r=52,C=2*Math.PI*r;
  const [sharing,setSharing]=useState(false);
  const cardRef=useRef(null);

  async function handleShare(){
    setSharing(true);
    try{
      const html2canvas=(await import("html2canvas")).default;
      const canvas=await html2canvas(cardRef.current,{
        backgroundColor:null, scale:2, useCORS:true, logging:false
      });
      const dataUrl=canvas.toDataURL("image/png");
      const isNative=window?.Capacitor?.isNativePlatform?.();
      if(isNative){
        const {Filesystem,Directory}=await import("@capacitor/filesystem");
        const {Share}=await import("@capacitor/share");
        const b64=dataUrl.split(",")[1];
        const fileName=`rooster-result-${Date.now()}.png`;
        await Filesystem.writeFile({path:fileName,data:b64,directory:Directory.Cache});
        const fileUri=await Filesystem.getUri({path:fileName,directory:Directory.Cache});
        await Share.share({
          title:"My Rooster CBT Result",
          text:`I scored ${score}/400 on Rooster CBT! 🐓`,
          url:fileUri.uri,
          dialogTitle:"Share your result"
        });
      } else {
        const a=document.createElement("a");
        a.href=dataUrl;
        a.download=`rooster-result-${score}.png`;
        a.click();
      }
    }catch(e){ console.warn("Share failed:",e); }
    setSharing(false);
  }

  return(
    <div className="screen fade">
      {/* Shareable card */}
      <div ref={cardRef} style={{background:"var(--bg)",padding:"4px 0 16px"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div className="lbl" style={{marginBottom:4}}>Exam Complete</div>
          <div style={{fontSize:22,fontWeight:800}}>Your Results</div>
          {user&&<div style={{fontSize:13,color:"var(--text3)",marginTop:4,fontWeight:600}}>{user.name}</div>}
        </div>

      <div style={{position:"relative",width:130,height:130,margin:"0 auto 24px"}}>
        <svg width="130" height="130" viewBox="0 0 130 130" style={{transform:"rotate(-90deg)"}}>
          <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg4)" strokeWidth="10"/>
          <circle cx="65" cy="65" r={r} fill="none" stroke={gc} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C*(1-p/100)} style={{transition:"stroke-dashoffset 1.2s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:28,fontWeight:800,color:gc,fontFamily:"var(--mono)"}}>{score}</div>
          <div style={{fontSize:10,color:"var(--text3)",fontWeight:700}}>out of 400</div>
          <div style={{fontSize:11,fontWeight:700,color:gc,marginTop:2}}>{grade}</div>
        </div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20}}>
        {[{l:"Correct",v:correct,c:"var(--green)"},{l:"Wrong",v:total-correct,c:"var(--red)"},{l:"Total",v:total,c:"var(--accent)"}].map(s=>(
          <div key={s.l} className="card" style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:800,color:s.c,fontFamily:"var(--mono)"}}>{s.v}</div>
            <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      {Object.keys(bySubject).length>1&&(
        <>
          <div className="lbl">By Subject</div>
          {Object.entries(bySubject).map(([sub,d])=>{
            const sp=pct(d.correct,d.total);
            return(
              <div key={sub} className="card" style={{marginBottom:10}}>
                <div className="row" style={{marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700}}>{sub}</div>
                  <div style={{fontSize:13,fontWeight:800,color:SC[sub]||"var(--accent)",fontFamily:"var(--mono)"}}>{sp}%</div>
                </div>
                <div className="prog"><div className="pf" style={{width:`${sp}%`,background:SC[sub]||"var(--accent)"}}/></div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:6,fontWeight:600}}>{d.correct} of {d.total} correct</div>
              </div>
            );
          })}
        </>
      )}
      </div>{/* end shareable card */}

      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:20}}>
        <button className="btn bp" onClick={handleShare} disabled={sharing}>
          <I n="share" sz={15} c="#fff"/>
          {sharing?"Preparing…":"Share Result"}
        </button>
        <button className="btn bp" onClick={()=>setScreen("review")}><I n="book" sz={15} c="#fff"/> Review Answers</button>
        <button className="btn bg" onClick={()=>setScreen("select")}>Try Again</button>
        <button className="btn bg" onClick={()=>setScreen("home")}><I n="home" sz={15}/> Home</button>
      </div>
    </div>
  );
}

// ─── REVIEW SCREEN ────────────────────────────────────────────────────────────
function ReviewScreen({questions,answers,setScreen}){
  const [filter,setFilter]=useState("all");
  const list=questions.filter(q=>{
    if(filter==="wrong") return answers[q.id]!==q.a;
    if(filter==="correct") return answers[q.id]===q.a;
    return true;
  });

  return(
    <div className="screen fade">
      <div className="row" style={{marginBottom:16}}>
        <div style={{fontSize:18,fontWeight:800}}>Review Answers</div>
        <button className="btn bg bsm" onClick={()=>setScreen("result")}><I n="left" sz={15}/></button>
      </div>
      <div className="tabs">
        {[{id:"all",l:"All"},{id:"wrong",l:"Wrong"},{id:"correct",l:"Correct"}].map(t=>(
          <button key={t.id} className={`tab ${filter===t.id?"on":""}`} onClick={()=>setFilter(t.id)}>{t.l}</button>
        ))}
      </div>
      {list.length===0&&<div className="empty"><I n="check" sz={30} c="var(--text3)"/><p>No questions in this category.</p></div>}
      {list.map(q=>{
        const chosen=answers[q.id],correct=chosen===q.a;
        return(
          <div key={q.id} className="card" style={{marginBottom:14}}>
            <div className="row" style={{marginBottom:8,gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,fontWeight:700,color:"var(--text3)",fontFamily:"var(--mono)"}}>{q.s} · {q.y} · {q.t}</span>
              <span className={`bdg ${correct?"bok":"bfail"}`}>{correct?"Correct":"Wrong"}</span>
            </div>
            <div style={{fontSize:14,lineHeight:1.75,marginBottom:12}}>{q.q}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {Object.entries(q.o).map(([k,v])=>{
                const isCor=k===q.a,isBad=k===chosen&&!correct;
                return(
                  <div key={k} style={{padding:"8px 10px",borderRadius:"var(--r3)",fontSize:12,fontWeight:600,
                    background:isCor?"rgba(34,197,94,.08)":isBad?"rgba(201,97,74,.07)":"var(--bg3)",
                    color:isCor?"var(--green)":isBad?"var(--red)":"var(--text3)"}}>
                    {k}. {v}
                  </div>
                );
              })}
            </div>
            <div className="expl" style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--accent)",marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Explanation</div>
              <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.8}}>{q.e}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── STATS SCREEN ─────────────────────────────────────────────────────────────
function StatsScreen({store,loaded}){
  if(!loaded) return <div className="screen"><div className="empty"><p>Loading...</p></div></div>;
  const sessions=store?.sessions||[];
  const topicStats=store?.topicStats||{};
  const subjStats=store?.subjectStats||{};
  const totalQ=store?.totalQ||0; const totalC=store?.totalC||0;

  if(!sessions.length) return(
    <div className="screen fade">
      <div style={{fontSize:18,fontWeight:800,marginBottom:24}}>Statistics</div>
      <div className="empty"><I n="chart" sz={34} c="var(--text3)"/><p>No data yet. Complete a session to see your statistics.</p></div>
    </div>
  );

  const avg=totalQ?pct(totalC,totalQ):0;
  const weak=Object.values(topicStats).filter(t=>t.total>=2)
    .map(t=>({...t,score:pct(t.correct,t.total)})).sort((a,b)=>a.score-b.score).slice(0,5);

  return(
    <div className="screen fade">
      <div style={{fontSize:18,fontWeight:800,marginBottom:20}}>Statistics</div>
      <div className="card-acc" style={{marginBottom:20,textAlign:"center"}}>
        <div className="lbl" style={{marginBottom:4}}>Overall Average</div>
        <div style={{fontSize:44,fontWeight:800,color:avg>=50?"var(--accent)":"var(--red)",fontFamily:"var(--mono)"}}>
          {getScore(totalC,totalQ)}<span style={{fontSize:16,color:"var(--text3)",fontWeight:600}}>/400</span>
        </div>
        <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{totalC} correct from {totalQ} questions · {sessions.length} session{sessions.length>1?"s":""}</div>
      </div>

      {Object.keys(subjStats).length>0&&(
        <>
          <div className="lbl">Subject Performance</div>
          {ALL_SUBJECTS.filter(s=>subjStats[s]).map(s=>{
            const d=subjStats[s]; const sp=pct(d.correct,d.total);
            const status=sp>=70?"Strong":sp>=50?"Improving":"Needs Focus";
            return(
              <div key={s} className="card" style={{marginBottom:10}}>
                <div className="row" style={{marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:14}}>{s}</div>
                  <span style={{fontFamily:"var(--mono)",fontWeight:800,color:SC[s]||"var(--accent)",fontSize:15}}>{sp}%</span>
                </div>
                <div className="prog"><div className="pf" style={{width:`${sp}%`,background:SC[s]||"var(--accent)"}}/></div>
                <div className="row" style={{marginTop:6}}>
                  <span style={{fontSize:11,color:"var(--text3)",fontWeight:600}}>{d.correct}/{d.total} correct · {d.sessions} session{d.sessions>1?"s":""}</span>
                  <span style={{fontSize:11,fontWeight:700,color:sp>=70?"var(--green)":sp>=50?"var(--amber)":"var(--red)"}}>{status}</span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {weak.length>0&&(
        <>
          <div className="lbl" style={{marginTop:20}}>Topics to Improve</div>
          {weak.map(t=>(
            <div key={t.topic+t.subject} className="card" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:"var(--r3)",flexShrink:0,background:"rgba(201,97,74,.08)",
                display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontWeight:800,fontSize:13,color:"var(--red)"}}>
                {t.score}%
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{t.topic}</div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{t.subject} · {t.total} attempt{t.total>1?"s":""}</div>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="lbl" style={{marginTop:20}}>Session History</div>
      {sessions.map(s=>(
        <div key={s.id} className="card" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:"var(--r3)",flexShrink:0,
            background:s.pct>=50?"rgba(218,119,86,.09)":"rgba(201,97,74,.07)",
            display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontWeight:800,fontSize:13,
            color:s.pct>=50?"var(--accent)":"var(--red)"}}>
            {s.score}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {s.mode==="mixed"?`Mixed${s.year?` · ${s.year}`:""}`:s.subject}
            </div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{s.correct}/{s.total} correct · {fmtDate(s.date)}</div>
          </div>
          <span className={`bdg ${s.pct>=50?"bok":"bfail"}`}>{s.pct>=70?"Pass":s.pct>=50?"Fair":"Fail"}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS SCREEN ──────────────────────────────────────────────────────────
function SettingsScreen({store,setStore,user,setUser}){
  const [clearing,setClearing]=useState(false);
  const [done,setDone]=useState(false);
  const [updateStatus,setUpdateStatus]=useState("idle");
  const [updateInfo,setUpdateInfo]=useState(null);
  const [debugLog,setDebugLog]=useState([]);
  const [editName,setEditName]=useState(user?.name||"");
  const [editHour,setEditHour]=useState(user?.reminderHour??18);
  const [savingProfile,setSavingProfile]=useState(false);
  const [profileSaved,setProfileSaved]=useState(false);
  const count=(store?.sessions||[]).length;

  async function handleSaveProfile(){
    if(!editName.trim()) return;
    setSavingProfile(true);
    const u={...user, name:editName.trim(), reminderHour:editHour, reminderMinute:0};
    await saveUser(u);
    setUser(u);
    await scheduleNotifications(u.name, u.reminderHour, u.reminderMinute);
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(()=>setProfileSaved(false),2500);
  }

  const fmt12=h=>{const ampm=h>=12?"PM":"AM";return`${h%12||12}:00 ${ampm}`;};

  async function handleClear(){
    setClearing(true);
    await clearStore();
    setStore(initStore());
    setClearing(false); setDone(true);
    setTimeout(()=>setDone(false),3000);
  }

  async function handleCheckUpdate(){
    setUpdateStatus("checking");
    setUpdateInfo(null);
    const log=[];
    const url=`${UPDATE_CHECK_URL}?t=${Date.now()}`;
    log.push(`URL: ${url}`);
    try{
      log.push("Fetching...");
      let data;
      const isNative=typeof window!=="undefined" && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
      log.push(`Native: ${isNative}`);
      if(isNative){
        log.push("Using XHR...");
        data=await new Promise((resolve,reject)=>{
          const xhr=new XMLHttpRequest();
          xhr.open("GET",url,true);
          xhr.setRequestHeader("Accept","application/json");
          xhr.onload=()=>{
            log.push(`XHR status: ${xhr.status}`);
            if(xhr.status===200){
              try{ resolve(JSON.parse(xhr.responseText)); }
              catch(e){ reject(new Error("Bad JSON")); }
            } else {
              reject(new Error(`HTTP ${xhr.status}`));
            }
          };
          xhr.onerror=()=>reject(new Error("XHR network error"));
          xhr.ontimeout=()=>reject(new Error("XHR timeout"));
          xhr.timeout=10000;
          xhr.send();
        });
      }else{
        const res=await fetch(url,{cache:"no-store"});
        log.push(`Status: ${res.status} ${res.statusText}`);
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        data=await res.json();
      }
      if(!data?.version) throw new Error("No version field");
      log.push(`Remote: v${data.version} | Local: v${VERSION}`);
      setUpdateInfo(data);
      const r=data.version.split(".").map(Number);
      const l=VERSION.split(".").map(Number);
      let newer=false;
      for(let i=0;i<Math.max(r.length,l.length);i++){
        if((r[i]||0)>(l[i]||0)){newer=true;break;}
        if((r[i]||0)<(l[i]||0)) break;
      }
      log.push(`Newer: ${newer}`);
      setDebugLog(log);
      setUpdateStatus(newer?"available":"uptodate");
    }catch(e){
      log.push(`ERROR: ${e.message||e}`);
      setDebugLog(log);
      setUpdateStatus("error");
    }
  }

  const rows=[
    {l:"App",v:`Rooster — JAMB UTME Simulator`},
    {l:"Version",v:VERSION},
    {l:"Years Covered",v:"2010 – 2025"},
    {l:"Subjects",v:`${ALL_SUBJECTS.length} subjects`},
    {l:"Question Bank",v:`${QB.length} questions`},
    {l:"Exam Duration",v:"105 minutes"},
    {l:"Sessions Stored",v:String(count)},
  ];

  return(
    <div className="screen fade">
      <div style={{fontSize:18,fontWeight:800,marginBottom:24}}>Settings</div>

      {user && (
        <>
          <div className="lbl">Profile</div>
          <div className="card" style={{marginBottom:20}}>
            <div style={{fontSize:13,color:"var(--text3)",fontWeight:600,marginBottom:8}}>Your Name</div>
            <input
              value={editName}
              onChange={e=>setEditName(e.target.value)}
              style={{width:"100%",padding:"10px 12px",borderRadius:"var(--r3)",
                border:"1.5px solid var(--border2)",background:"var(--bg3)",
                color:"var(--text)",fontSize:14,fontWeight:600,outline:"none",
                boxSizing:"border-box",marginBottom:16,fontFamily:"var(--sans)"}}
            />
            <div style={{fontSize:13,color:"var(--text3)",fontWeight:600,marginBottom:8}}>Daily Reminder</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
              {[7,9,12,15,18,20,21].map(h=>(
                <button key={h} onClick={()=>setEditHour(h)}
                  className={`btn ${editHour===h?"bp":"bg"}`}
                  style={{padding:"7px 12px",fontSize:12,borderRadius:999}}>
                  {fmt12(h)}
                </button>
              ))}
            </div>
            {profileSaved?(
              <div style={{padding:12,borderRadius:"var(--r3)",background:"rgba(127,183,126,.07)",
                color:"var(--green)",fontSize:13,fontWeight:600,textAlign:"center",
                border:"1px solid rgba(127,183,126,.18)"}}>
                Saved! Notifications updated ✓
              </div>
            ):(
              <button className="btn bp" onClick={handleSaveProfile} disabled={savingProfile||!editName.trim()}>
                <I n="check" sz={15} c="#fff"/>
                {savingProfile?"Saving…":"Save Changes"}
              </button>
            )}
          </div>
        </>
      )}

      <div className="lbl">App Info</div>
      <div className="card" style={{marginBottom:20}}>
        {rows.map((row,i)=>(
          <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
            padding:"11px 0",borderBottom:i<rows.length-1?"1px solid var(--border)":"none"}}>
            <div style={{fontSize:13,color:"var(--text3)",fontWeight:600,flexShrink:0,marginRight:12}}>{row.l}</div>
            <div style={{fontSize:13,fontWeight:600,textAlign:"right",color:"var(--text2)",maxWidth:"58%"}}>{row.v}</div>
          </div>
        ))}
      </div>

      <div className="lbl">Updates</div>
      <div className="card" style={{marginBottom:20}}>

        {updateStatus==="uptodate" && (
          <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:14,
            fontSize:13,fontWeight:600,color:"var(--green)"}}>
            <I n="check-circle" sz={15} c="var(--green)"/>
            You're on the latest version (v{VERSION})
          </div>
        )}

        {updateStatus==="available" && updateInfo && (
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,
              fontSize:13,fontWeight:700,color:"var(--accent)"}}>
              <I n="zap" sz={14} c="var(--accent)"/>
              v{updateInfo.version} is available!
            </div>
            {updateInfo.whatsNew?.length>0 && (
              <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.7,marginBottom:4}}>
                {updateInfo.whatsNew.map((w,i)=>(
                  <div key={i} style={{display:"flex",gap:6}}>
                    <span style={{color:"var(--accent)"}}>•</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {updateStatus==="error" && (
          <div style={{paddingBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,
              fontSize:13,fontWeight:600,color:"var(--red)"}}>
              <I n="alert-circle" sz={15} c="var(--red)"/>
              Couldn't reach update server.
            </div>
            <div style={{background:"var(--bg2)",borderRadius:8,padding:10}}>
              {debugLog.map((line,i)=>(
                <div key={i} style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--text3)",
                  lineHeight:1.8,wordBreak:"break-all"}}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {updateStatus==="available" && updateInfo?.apkUrl && (
          <a href={updateInfo.apkUrl} target="_blank" rel="noopener noreferrer"
            style={{textDecoration:"none",display:"block",marginBottom:10}}>
            <button className="btn" style={{width:"100%",background:"var(--accent)",color:"#fff",border:"none"}}>
              <I n="download" sz={15} c="#fff"/>
              Download v{updateInfo.version}
            </button>
          </a>
        )}

        {updateStatus!=="available"?(
          <button className="btn bd" onClick={handleCheckUpdate} disabled={updateStatus==="checking"}>
            <I n="refresh-cw" sz={15} c="var(--text2)"/>
            {updateStatus==="checking"?"Checking…":"Check for Update"}
          </button>
        ):(
          <button className="btn bd" onClick={handleCheckUpdate} style={{marginTop:6}}>
            <I n="refresh-cw" sz={13} c="var(--text3)"/>
            <span style={{fontSize:12,color:"var(--text3)"}}>Re-check</span>
          </button>
        )}

      </div>

      <div className="lbl">Data</div>
      <div className="card">
        <div style={{fontSize:14,color:"var(--text2)",lineHeight:1.75,marginBottom:16}}>
          Send any complaints to frntcoda@gmail.com
        </div>
        {done?(
          <div style={{padding:14,borderRadius:"var(--r3)",background:"rgba(127,183,126,.07)",
            color:"var(--green)",fontSize:14,fontWeight:600,textAlign:"center",border:"1px solid rgba(127,183,126,.18)"}}>
            All history cleared.
          </div>
        ):(
          <button className="btn bd" onClick={handleClear} disabled={clearing||count===0}>
            <I n="trash" sz={15} c="var(--red)"/>
            {clearing?"Clearing...":count===0?"No Data to Clear":"Clear All History"}
          </button>
        )}
      </div>

      <div className="footer" style={{marginTop:32}}>
        Rooster v{VERSION} by frNtcOda
      </div>
    </div>
  );
}
