import { useState } from "react";

const INIT_COMPANIES = [
  { id:1, name:"한진물류",  contact:"010-1234-5678", forklifts:6, manager:"김철수", address:"부산시 영도구 1", bizNo:"123-45-67890", email:"hanjin@test.com", vehicles:[{type:"3톤 지게차",count:4},{type:"5톤 지게차",count:2}] },
  { id:2, name:"대한운수",  contact:"010-2345-6789", forklifts:4, manager:"이영희", address:"부산시 남구 2", bizNo:"234-56-78901", email:"daehan@test.com", vehicles:[{type:"3톤 지게차",count:4}] },
  { id:3, name:"현대항운",  contact:"010-3456-7890", forklifts:8, manager:"박민수", address:"부산시 동구 3", bizNo:"345-67-89012", email:"hyundai@test.com", vehicles:[{type:"3톤 지게차",count:5},{type:"7톤 지게차",count:3}] },
];

const INIT_USERS = [
  { id:0, loginId:"admin",   pw:"1234", name:"관리자",        role:"admin",   companyId:null },
  { id:1, loginId:"hanjin",  pw:"1234", name:"한진물류 담당자", role:"company", companyId:1 },
  { id:2, loginId:"daehan",  pw:"1234", name:"대한운수 담당자", role:"company", companyId:2 },
  { id:3, loginId:"hyundai", pw:"1234", name:"현대항운 담당자", role:"company", companyId:3 },
];

const INIT_SHIPS = [
  { id:1, name:"현대 마리나호", berth:"3부두", eta:"2026-04-03", cargo:"컨테이너 240TEU" },
  { id:2, name:"대한 스타호",   berth:"1부두", eta:"2026-04-05", cargo:"자동차 부품" },
  { id:3, name:"진영 오션호",   berth:"2부두", eta:"2026-04-07", cargo:"철강재" },
  { id:4, name:"태평양호",      berth:"2부두", eta:"2026-04-08", cargo:"컨테이너 180TEU" },
  { id:5, name:"코리아 스타",   berth:"1부두", eta:"2026-04-09", cargo:"자동차 부품" },
];

const INIT_DISPATCH = [
  { id:1, shipId:1, companyId:1, forklifts:4, startTime:"08:00", endTime:"17:00", extraHours:2, status:"승인완료", date:"2026-04-03", unitPrice:50000, rejectReason:"", companyNote:"" },
  { id:2, shipId:2, companyId:2, forklifts:3, startTime:"09:00", endTime:"18:00", extraHours:0, status:"요청중",   date:"2026-04-05", unitPrice:50000, rejectReason:"", companyNote:"" },
  { id:3, shipId:3, companyId:3, forklifts:5, startTime:"07:00", endTime:"16:00", extraHours:3, status:"요청중",   date:"2026-04-07", unitPrice:50000, rejectReason:"", companyNote:"" },
  { id:4, shipId:1, companyId:1, forklifts:2, startTime:"08:00", endTime:"17:00", extraHours:1, status:"승인완료", date:"2026-03-15", unitPrice:50000, rejectReason:"", companyNote:"" },
  { id:5, shipId:2, companyId:3, forklifts:3, startTime:"07:00", endTime:"16:00", extraHours:0, status:"업체수락", date:"2026-03-20", unitPrice:50000, rejectReason:"", companyNote:"작업 준비 완료" },
  { id:6, shipId:1, companyId:2, forklifts:2, startTime:"10:00", endTime:"19:00", extraHours:1, status:"요청중",   date:"2026-04-03", unitPrice:50000, rejectReason:"", companyNote:"" },
  { id:7, shipId:4, companyId:1, forklifts:3, startTime:"08:00", endTime:"17:00", extraHours:0, status:"요청중",   date:"2026-04-08", unitPrice:50000, rejectReason:"", companyNote:"" },
  { id:8, shipId:5, companyId:2, forklifts:2, startTime:"09:00", endTime:"18:00", extraHours:2, status:"요청중",   date:"2026-04-09", unitPrice:50000, rejectReason:"", companyNote:"" },
];

const STATUS_STYLE: Record<string, {bg:string,color:string}> = {
  "요청중":   { bg:"#E6F1FB", color:"#185FA5" },
  "업체수락": { bg:"#EEEDFE", color:"#534AB7" },
  "승인완료": { bg:"#EAF3DE", color:"#3B6D11" },
  "업체거절": { bg:"#FCEBEB", color:"#A32D2D" },
  "취소":     { bg:"#F1EFE8", color:"#5F5E5A" },
};

const ADMIN_TABS   = ["대시보드","주간계획표","배차요청","최종승인","완료내역","입항계획","업체관리","월별정산"];
const COMPANY_TABS = ["내 업무현황","배차 수락/거절","업무기록","업체정보","월별정산"];

const calcAmount = (d: any) => 9*d.forklifts*d.unitPrice + d.extraHours*d.forklifts*Math.round(d.unitPrice*1.5);

const getWeekDates = (baseDate: string) => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const mon = new Date(d); mon.setDate(d.getDate() - (day===0?6:day-1));
  return Array.from({length:7}, (_,i) => { const x=new Date(mon); x.setDate(mon.getDate()+i); return x.toISOString().split("T")[0]; });
};

export default function App() {
  const [users, setUsers]             = useState(INIT_USERS);
  const [companies, setCompanies]     = useState(INIT_COMPANIES);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab]     = useState("");
  const [ships, setShips]             = useState(INIT_SHIPS);
  const [dispatches, setDispatches]   = useState(INIT_DISPATCH);
  const [weekBase, setWeekBase]       = useState("2026-04-03");
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [showAddShip, setShowAddShip] = useState(false);
  const [showAddDispatch, setShowAddDispatch] = useState(false);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loginId, setLoginId]   = useState("");
  const [loginPw, setLoginPw]   = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [reg, setReg] = useState({ loginId:"", pw:"", pw2:"", name:"", companyName:"", manager:"", contact:"", address:"", bizNo:"", email:"" });
  const [regErr, setRegErr] = useState("");
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [newVehicle, setNewVehicle] = useState({ type:"", count:1 });
  const [newShip, setNewShip] = useState({ name:"", berth:"", eta:"", cargo:"" });
  const [newDispatch, setNewDispatch] = useState({ shipId:"", companyId:"", forklifts:2, startTime:"08:00", endTime:"17:00", extraHours:0, unitPrice:50000 });

  const login = () => {
    const u = users.find(u=>u.loginId===loginId && u.pw===loginPw);
    if (!u) { setLoginErr("아이디 또는 비밀번호가 틀립니다."); return; }
    setCurrentUser(u); setActiveTab(u.role==="admin"?"대시보드":"내 업무현황");
    setLoginId(""); setLoginPw(""); setLoginErr("");
  };

  const register = () => {
    if (!reg.loginId||!reg.pw||!reg.companyName||!reg.manager||!reg.contact) { setRegErr("필수 항목을 모두 입력하세요."); return; }
    if (reg.pw !== reg.pw2) { setRegErr("비밀번호가 일치하지 않습니다."); return; }
    if (users.find(u=>u.loginId===reg.loginId)) { setRegErr("이미 사용 중인 아이디입니다."); return; }
    const newComp = { id:companies.length+1, name:reg.companyName, contact:reg.contact, forklifts:0, manager:reg.manager, address:reg.address, bizNo:reg.bizNo, email:reg.email, vehicles:[] as any[] };
    const newUser = { id:users.length, loginId:reg.loginId, pw:reg.pw, name:reg.name||reg.manager, role:"company", companyId:newComp.id };
    setCompanies([...companies, newComp]);
    setUsers([...users, newUser]);
    setShowRegister(false);
    setReg({ loginId:"", pw:"", pw2:"", name:"", companyName:"", manager:"", contact:"", address:"", bizNo:"", email:"" });
    setRegErr("");
    alert("가입 완료! 로그인 해주세요.");
  };

  const logout = () => { setCurrentUser(null); setActiveTab(""); };
  const setStatus = (id: number, status: string, extra: any={}) => setDispatches(ds=>ds.map(d=>d.id===id?{...d,status,...extra}:d));

  const addShip = () => {
    if (!newShip.name||!newShip.eta) return;
    setShips([...ships,{id:ships.length+1,...newShip}]);
    setNewShip({name:"",berth:"",eta:"",cargo:""}); setShowAddShip(false);
  };

  const addDispatch = () => {
    if (!newDispatch.shipId||!newDispatch.companyId) return;
    const ship = ships.find(s=>s.id===Number(newDispatch.shipId));
    setDispatches([...dispatches,{ id:dispatches.length+1, ...newDispatch, shipId:Number(newDispatch.shipId), companyId:Number(newDispatch.companyId), forklifts:Number(newDispatch.forklifts), extraHours:Number(newDispatch.extraHours), unitPrice:Number(newDispatch.unitPrice), status:"요청중", date:ship?.eta||"", rejectReason:"", companyNote:"" }]);
    setNewDispatch({shipId:"",companyId:"",forklifts:2,startTime:"08:00",endTime:"17:00",extraHours:0,unitPrice:50000}); setShowAddDispatch(false);
  };

  const saveCompany = () => {
    setCompanies(companies.map(c=>c.id===editingCompany.id?editingCompany:c));
    setEditingCompany(null);
  };

  const s: any = {
    wrap:      { fontFamily:"sans-serif", maxWidth:960, margin:"0 auto", paddingBottom:"2rem" },
    header:    { background:"#1a3a5c", color:"#fff", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderRadius:"10px 10px 0 0" },
    tabBar:    { display:"flex", borderBottom:"1px solid #e0e0e0", background:"#f8f9fa", flexWrap:"wrap" },
    tab:   (a:boolean)=>({ padding:"9px 14px", fontSize:13, cursor:"pointer", border:"none", background:a?"#fff":"transparent", color:a?"#1a3a5c":"#666", fontWeight:a?700:400, borderBottom:a?"2px solid #1a3a5c":"2px solid transparent" }),
    body:      { padding:"20px" },
    card:      { background:"#fff", border:"1px solid #e8e8e8", borderRadius:10, padding:"16px", marginBottom:14 },
    infoCard:  { background:"#f8fbff", border:"1px solid #b5d4f4", borderRadius:10, padding:"16px", marginBottom:14 },
    metricGrid:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 },
    metric:    { background:"#f0f4fa", borderRadius:8, padding:"14px 16px", textAlign:"center" },
    metricVal: { fontSize:22, fontWeight:700, color:"#1a3a5c" },
    metricLbl: { fontSize:11, color:"#666", marginTop:2 },
    table:     { width:"100%", borderCollapse:"collapse", fontSize:13 },
    th:        { background:"#f0f4fa", padding:"8px 10px", textAlign:"left", color:"#444", fontWeight:600, borderBottom:"1px solid #e0e0e0" },
    td:        { padding:"8px 10px", borderBottom:"1px solid #f0f0f0", verticalAlign:"middle" },
    badge: (st:string)=>({ ...(STATUS_STYLE[st]||{bg:"#eee",color:"#555"}), padding:"2px 9px", borderRadius:12, fontSize:12, fontWeight:600, display:"inline-block" }),
    btn:       { padding:"7px 16px", borderRadius:7, border:"none", cursor:"pointer", fontSize:13, fontWeight:600 },
    btnP:      { background:"#1a3a5c", color:"#fff" },
    btnS:      { background:"#3B6D11", color:"#fff" },
    btnD:      { background:"#A32D2D", color:"#fff" },
    btnPurple: { background:"#534AB7", color:"#fff" },
    btnGray:   { background:"#f0f0f0", color:"#555" },
    input:     { padding:"7px 10px", border:"1px solid #ddd", borderRadius:7, fontSize:13, width:"100%", boxSizing:"border-box" },
    label:     { fontSize:12, color:"#555", marginBottom:3, display:"block" },
    fgrid:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 },
    row:       { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 },
    sec:       { fontSize:16, fontWeight:700, color:"#1a3a5c", marginBottom:12 },
    overlay:   { position:"fixed" as const, top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 },
    modal:     { background:"#fff", borderRadius:12, padding:"24px", width:400, maxWidth:"95%" },
  };

  const DispatchCard = ({d, adminView=false, companyView=false}: any) => {
    const ship = ships.find(sh=>sh.id===d.shipId);
    const comp = companies.find(c=>c.id===d.companyId);
    const [note, setNote] = useState("");
    const bc = d.status==="승인완료"?"#3B6D11":d.status==="업체거절"||d.status==="취소"?"#ccc":d.status==="업체수락"?"#534AB7":"#378ADD";
    return (
      <div style={{...s.card, borderLeft:`4px solid ${bc}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" as const}}>
            <span style={{fontWeight:700,fontSize:14}}>{ship?.name}</span>
            {adminView&&<span style={{fontSize:13,color:"#555"}}>{comp?.name}</span>}
            <span style={{fontSize:12,color:"#888"}}>{ship?.berth}</span>
          </div>
          <span style={s.badge(d.status)}>{d.status}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,fontSize:13,color:"#555",marginBottom:10,background:"#f8f9fa",padding:"10px 12px",borderRadius:8}}>
          <div>날짜: <b>{d.date}</b></div><div>지게차: <b>{d.forklifts}대</b></div><div>단가: <b>{d.unitPrice.toLocaleString()}원</b></div>
          <div>업무: <b>{d.startTime}~{d.endTime}</b></div><div>추가: <b>{d.extraHours}h</b></div><div>금액: <b style={{color:"#1a3a5c"}}>{calcAmount(d).toLocaleString()}원</b></div>
        </div>
        {d.companyNote&&<div style={{fontSize:12,color:"#534AB7",background:"#EEEDFE",padding:"6px 10px",borderRadius:6,marginBottom:8}}>업체 메모: {d.companyNote}</div>}
        {d.rejectReason&&<div style={{fontSize:12,color:"#A32D2D",background:"#FCEBEB",padding:"6px 10px",borderRadius:6,marginBottom:8}}>거절 사유: {d.rejectReason}</div>}
        {adminView&&d.status==="업체수락"&&<div style={{display:"flex",gap:8}}><button style={{...s.btn,...s.btnS}} onClick={()=>setStatus(d.id,"승인완료")}>최종 승인</button><button style={{...s.btn,...s.btnD}} onClick={()=>{setRejectModal({id:d.id});setRejectReason("");}}>취소</button></div>}
        {adminView&&d.status==="요청중"&&<button style={{...s.btn,...s.btnGray}} onClick={()=>setStatus(d.id,"취소")}>요청 취소</button>}
        {companyView&&d.status==="요청중"&&(
          <div>
            <div style={{marginBottom:8}}><label style={s.label}>메모 (선택)</label><input style={s.input} placeholder="메모 후 수락" value={note} onChange={e=>setNote(e.target.value)}/></div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...s.btn,...s.btnPurple}} onClick={()=>setStatus(d.id,"업체수락",{companyNote:note})}>수락</button>
              <button style={{...s.btn,...s.btnD}} onClick={()=>{setRejectModal({id:d.id});setRejectReason("");}}>거절</button>
            </div>
          </div>
        )}
        {companyView&&d.status==="업체수락"&&<div style={{fontSize:13,color:"#534AB7",background:"#EEEDFE",padding:"8px 12px",borderRadius:7}}>수락 완료 — 관리자 최종 승인 대기 중</div>}
      </div>
    );
  };

  const DispatchForm = () => (
    <div style={s.infoCard}>
      <div style={{fontWeight:600,fontSize:14,color:"#185FA5",marginBottom:10}}>배차 요청 등록</div>
      <div style={s.fgrid}>
        <div><label style={s.label}>선박</label><select style={s.input} value={newDispatch.shipId} onChange={e=>setNewDispatch({...newDispatch,shipId:e.target.value})}><option value="">선택</option>{ships.map(sh=><option key={sh.id} value={sh.id}>{sh.name} ({sh.eta})</option>)}</select></div>
        <div><label style={s.label}>협력업체</label><select style={s.input} value={newDispatch.companyId} onChange={e=>setNewDispatch({...newDispatch,companyId:e.target.value})}><option value="">선택</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label style={s.label}>지게차 대수</label><input style={s.input} type="number" min="1" value={newDispatch.forklifts} onChange={e=>setNewDispatch({...newDispatch,forklifts:Number(e.target.value)})}/></div>
        <div><label style={s.label}>단가(원/h/대)</label><input style={s.input} type="number" value={newDispatch.unitPrice} onChange={e=>setNewDispatch({...newDispatch,unitPrice:Number(e.target.value)})}/></div>
        <div><label style={s.label}>시작</label><input style={s.input} type="time" value={newDispatch.startTime} onChange={e=>setNewDispatch({...newDispatch,startTime:e.target.value})}/></div>
        <div><label style={s.label}>종료</label><input style={s.input} type="time" value={newDispatch.endTime} onChange={e=>setNewDispatch({...newDispatch,endTime:e.target.value})}/></div>
        <div><label style={s.label}>추가근무(h)</label><input style={s.input} type="number" min="0" value={newDispatch.extraHours} onChange={e=>setNewDispatch({...newDispatch,extraHours:Number(e.target.value)})}/></div>
      </div>
      <button style={{...s.btn,...s.btnP}} onClick={addDispatch}>요청 전송</button>
    </div>
  );

  if (!currentUser) {
    if (showRegister) return (
      <div style={s.wrap}>
        <div style={s.header}><div style={{fontSize:17,fontWeight:700}}>협력업체 회원가입</div></div>
        <div style={{...s.body,maxWidth:520,margin:"20px auto"}}>
          <div style={{...s.card,padding:24}}>
            <div style={{...s.sec,marginBottom:16}}>업체 정보 등록</div>
            <div style={s.fgrid}>
              <div><label style={s.label}>아이디 *</label><input style={s.input} value={reg.loginId} onChange={e=>setReg({...reg,loginId:e.target.value})} placeholder="로그인 아이디"/></div>
              <div><label style={s.label}>담당자명 *</label><input style={s.input} value={reg.manager} onChange={e=>setReg({...reg,manager:e.target.value})} placeholder="담당자 이름"/></div>
              <div><label style={s.label}>비밀번호 *</label><input style={s.input} type="password" value={reg.pw} onChange={e=>setReg({...reg,pw:e.target.value})}/></div>
              <div><label style={s.label}>비밀번호 확인 *</label><input style={s.input} type="password" value={reg.pw2} onChange={e=>setReg({...reg,pw2:e.target.value})}/></div>
              <div><label style={s.label}>회사명 *</label><input style={s.input} value={reg.companyName} onChange={e=>setReg({...reg,companyName:e.target.value})} placeholder="회사명"/></div>
              <div><label style={s.label}>연락처 *</label><input style={s.input} value={reg.contact} onChange={e=>setReg({...reg,contact:e.target.value})} placeholder="010-0000-0000"/></div>
              <div><label style={s.label}>사업자번호</label><input style={s.input} value={reg.bizNo} onChange={e=>setReg({...reg,bizNo:e.target.value})} placeholder="000-00-00000"/></div>
              <div><label style={s.label}>이메일</label><input style={s.input} value={reg.email} onChange={e=>setReg({...reg,email:e.target.value})} placeholder="email@company.com"/></div>
            </div>
            <div style={{marginBottom:10}}><label style={s.label}>주소</label><input style={s.input} value={reg.address} onChange={e=>setReg({...reg,address:e.target.value})} placeholder="회사 주소"/></div>
            {regErr&&<div style={{color:"#A32D2D",fontSize:13,marginBottom:10}}>{regErr}</div>}
            <div style={{display:"flex",gap:8}}>
              <button style={{...s.btn,...s.btnP}} onClick={register}>가입 완료</button>
              <button style={{...s.btn,...s.btnGray}} onClick={()=>{setShowRegister(false);setRegErr("");}}>취소</button>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div style={s.wrap}>
        <div style={s.header}><div><div style={{fontSize:17,fontWeight:700}}>항구 지게차 배차 관리 시스템</div><div style={{fontSize:12,opacity:.8,marginTop:2}}>Port Forklift Dispatch Management</div></div></div>
        <div style={{...s.body,maxWidth:420,margin:"30px auto"}}>
          <div style={{...s.card,padding:28}}>
            <div style={{...s.sec,marginBottom:20,textAlign:"center" as const}}>로그인</div>
            <div style={{marginBottom:10}}><label style={s.label}>아이디</label><input style={s.input} value={loginId} onChange={e=>setLoginId(e.target.value)} onKeyDown={(e:any)=>e.key==="Enter"&&login()} placeholder="아이디 입력"/></div>
            <div style={{marginBottom:14}}><label style={s.label}>비밀번호</label><input style={s.input} type="password" value={loginPw} onChange={e=>setLoginPw(e.target.value)} onKeyDown={(e:any)=>e.key==="Enter"&&login()} placeholder="비밀번호 입력"/></div>
            {loginErr&&<div style={{color:"#A32D2D",fontSize:13,marginBottom:10}}>{loginErr}</div>}
            <button style={{...s.btn,...s.btnP,width:"100%",padding:"10px"}} onClick={login}>로그인</button>
            <div style={{textAlign:"center" as const,marginTop:16,fontSize:13,color:"#666"}}>
              협력업체 계정이 없으신가요?{" "}
              <span style={{color:"#185FA5",cursor:"pointer",fontWeight:600}} onClick={()=>setShowRegister(true)}>회원가입</span>
            </div>
            <div style={{marginTop:16,background:"#f8f9fa",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#888"}}>
              <b>테스트 계정</b><br/>관리자: admin / 1234<br/>한진물류: hanjin / 1234<br/>대한운수: daehan / 1234
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin      = currentUser.role==="admin";
  const tabs         = isAdmin ? ADMIN_TABS : COMPANY_TABS;
  const myDispatches = isAdmin ? dispatches : dispatches.filter((d:any)=>d.companyId===currentUser.companyId);
  const myCompany    = isAdmin ? null : companies.find(c=>c.id===currentUser.companyId);
  const needFinal    = dispatches.filter(d=>d.status==="업체수락").length;
  const needAction   = myDispatches.filter((d:any)=>d.status==="요청중").length;
  const completed    = dispatches.filter(d=>d.status==="승인완료");
  const weekDates    = getWeekDates(weekBase);

  const monthlyData = isAdmin
    ? companies.map(c=>{const items=dispatches.filter(d=>d.companyId===c.id&&d.date.startsWith(selectedMonth));return{...c,items,total:items.reduce((s,d)=>s+calcAmount(d),0),hrs:items.reduce((s,d)=>s+9*d.forklifts+d.extraHours*d.forklifts,0)};})
    : (()=>{const items=myDispatches.filter((d:any)=>d.date.startsWith(selectedMonth));return[{...myCompany,items,total:items.reduce((s:number,d:any)=>s+calcAmount(d),0),hrs:items.reduce((s:number,d:any)=>s+9*d.forklifts+d.extraHours*d.forklifts,0)}];})();

  return (
    <div style={s.wrap}>
      {rejectModal&&(
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:12,color:"#1a3a5c"}}>{isAdmin?"취소 사유":"거절 사유"}</div>
            <textarea style={{...s.input,height:80,resize:"vertical" as const}} placeholder="사유를 입력하세요" value={rejectReason} onChange={e=>setRejectReason(e.target.value)}/>
            <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"flex-end"}}>
              <button style={{...s.btn,...s.btnGray}} onClick={()=>setRejectModal(null)}>닫기</button>
              <button style={{...s.btn,...s.btnD}} onClick={()=>{setStatus(rejectModal.id,isAdmin?"취소":"업체거절",{rejectReason});setRejectModal(null);setRejectReason("");}}>확정</button>
            </div>
          </div>
        </div>
      )}
      <div style={s.header}>
        <div><div style={{fontSize:17,fontWeight:700}}>항구 지게차 배차 관리 시스템</div><div style={{fontSize:12,opacity:.8,marginTop:2}}>{currentUser.name} 로그인 중</div></div>
        <button onClick={logout} style={{...s.btn,background:"rgba(255,255,255,0.15)",color:"#fff",border:"1px solid rgba(255,255,255,0.3)"}}>로그아웃</button>
      </div>
      <div style={s.tabBar}>
        {tabs.map(t=>{
          const badge=t==="최종승인"?needFinal:t==="배차 수락/거절"?needAction:0;
          return <button key={t} style={s.tab(activeTab===t)} onClick={()=>setActiveTab(t)}>
            {t}{badge>0&&<span style={{marginLeft:4,background:"#E24B4A",color:"#fff",borderRadius:10,fontSize:11,padding:"1px 5px",fontWeight:700}}>{badge}</span>}
          </button>;
        })}
      </div>
      <div style={s.body}>

        {isAdmin&&activeTab==="대시보드"&&<>
          <div style={s.metricGrid}>
            <div style={s.metric}><div style={s.metricVal}>{ships.length}</div><div style={s.metricLbl}>입항 예정 선박</div></div>
            <div style={s.metric}><div style={s.metricVal}>{companies.length}</div><div style={s.metricLbl}>등록 협력업체</div></div>
            <div style={s.metric}><div style={s.metricVal}>{needFinal}</div><div style={s.metricLbl}>최종승인 대기</div></div>
            <div style={s.metric}><div style={s.metricVal}>{completed.length}</div><div style={s.metricLbl}>완료 배차</div></div>
          </div>
          <div style={s.sec}>이번 주 배차 현황</div>
          <div style={s.card}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
              {getWeekDates("2026-04-03").map(date=>{
                const dd=dispatches.filter(d=>d.date===date);
                const dayNames=["월","화","수","목","금","토","일"];
                const idx=new Date(date).getDay();
                const dn=dayNames[idx===0?6:idx-1];
                return<div key={date} style={{background:dd.length>0?"#f0f4fa":"#fafafa",borderRadius:8,padding:"8px 6px",textAlign:"center" as const,border:"1px solid #e8e8e8"}}>
                  <div style={{fontSize:11,color:"#888",marginBottom:2}}>{dn}</div>
                  <div style={{fontSize:12,fontWeight:600,color:"#1a3a5c",marginBottom:4}}>{date.slice(5)}</div>
                  <div style={{fontSize:18,fontWeight:700,color:dd.length>0?"#1a3a5c":"#ccc"}}>{dd.reduce((s,d)=>s+d.forklifts,0)}</div>
                  <div style={{fontSize:10,color:"#888"}}>대</div>
                  <div style={{fontSize:10,color:"#666",marginTop:2}}>{dd.length}건</div>
                </div>;
              })}
            </div>
          </div>
          <div style={s.sec}>업체별 배차 완료 현황</div>
          <div style={s.card}>
            <table style={s.table}>
              <thead><tr><th style={s.th}>업체명</th><th style={s.th}>완료건수</th><th style={s.th}>총 지게차</th><th style={s.th}>총 업무시간</th><th style={s.th}>완료금액</th></tr></thead>
              <tbody>{companies.map(c=>{const done=completed.filter(d=>d.companyId===c.id);return<tr key={c.id}><td style={{...s.td,fontWeight:600}}>{c.name}</td><td style={s.td}>{done.length}건</td><td style={s.td}>{done.reduce((s,d)=>s+d.forklifts,0)}대</td><td style={s.td}>{done.reduce((s,d)=>s+9*d.forklifts+d.extraHours*d.forklifts,0)}h</td><td style={{...s.td,fontWeight:600,color:"#1a3a5c"}}>{done.reduce((s,d)=>s+calcAmount(d),0).toLocaleString()}원</td></tr>;})}</tbody>
            </table>
          </div>
          {needFinal>0&&<><div style={s.sec}>최종 승인 필요 ({needFinal}건)</div>{dispatches.filter(d=>d.status==="업체수락").map(d=><DispatchCard key={d.id} d={d} adminView/>)}</>}
          <div style={{...s.card,background:"#f0f4fa",textAlign:"center" as const}}>
            <div style={{fontSize:13,color:"#666",marginBottom:4}}>승인완료 금액 합계</div>
            <div style={{fontSize:28,fontWeight:700,color:"#1a3a5c"}}>{completed.reduce((s,d)=>s+calcAmount(d),0).toLocaleString()}원</div>
          </div>
        </>}

        {isAdmin&&activeTab==="주간계획표"&&<>
          <div style={s.row}>
            <div style={s.sec}>주간 배차 계획표</div>
            <input type="date" style={{...s.input,width:"auto"}} value={weekBase} onChange={e=>setWeekBase(e.target.value)}/>
          </div>
          <div style={{...s.card,overflowX:"auto" as const}}>
            <table style={{...s.table,minWidth:700}}>
              <thead>
                <tr>
                  <th style={{...s.th,width:100}}>업체</th>
                  {weekDates.map(date=>{const dayNames=["월","화","수","목","금","토","일"];const idx=new Date(date).getDay();const dn=dayNames[idx===0?6:idx-1];return<th key={date} style={{...s.th,textAlign:"center" as const}}><div>{dn}</div><div style={{fontSize:11,fontWeight:400,color:"#888"}}>{date.slice(5)}</div></th>;})}
                </tr>
              </thead>
              <tbody>
                {companies.map(c=>(
                  <tr key={c.id}>
                    <td style={{...s.td,fontWeight:600,color:"#1a3a5c"}}>{c.name}</td>
                    {weekDates.map(date=>{const items=dispatches.filter(d=>d.companyId===c.id&&d.date===date);return<td key={date} style={{...s.td,textAlign:"center" as const,background:items.length>0?"#f8fbff":"#fff"}}>{items.length>0?<><div style={{fontSize:13,fontWeight:700,color:"#1a3a5c"}}>{items.reduce((s,d)=>s+d.forklifts,0)}대</div>{items.map(d=><div key={d.id}><span style={s.badge(d.status)}>{d.status}</span></div>)}</>:<span style={{color:"#ddd",fontSize:12}}>—</span>}</td>;})}
                  </tr>
                ))}
                <tr style={{background:"#f0f4fa"}}>
                  <td style={{...s.td,fontWeight:700}}>합계</td>
                  {weekDates.map(date=>{const total=dispatches.filter(d=>d.date===date).reduce((s,d)=>s+d.forklifts,0);return<td key={date} style={{...s.td,textAlign:"center" as const,fontWeight:700,color:total>0?"#1a3a5c":"#ccc"}}>{total>0?`${total}대`:"—"}</td>;})}
                </tr>
              </tbody>
            </table>
          </div>
          <div style={s.sec}>주간 입항 일정</div>
          <div style={s.card}>
            {ships.filter(sh=>weekDates.includes(sh.eta)).length===0
              ?<div style={{color:"#aaa",fontSize:13}}>이번 주 입항 선박 없음</div>
              :<table style={s.table}>
                <thead><tr><th style={s.th}>선박명</th><th style={s.th}>입항일</th><th style={s.th}>부두</th><th style={s.th}>화물</th><th style={s.th}>배차현황</th></tr></thead>
                <tbody>{ships.filter(sh=>weekDates.includes(sh.eta)).map(sh=>{const ds=dispatches.filter(d=>d.shipId===sh.id);return<tr key={sh.id}><td style={{...s.td,fontWeight:600}}>{sh.name}</td><td style={s.td}>{sh.eta}</td><td style={s.td}>{sh.berth}</td><td style={s.td}>{sh.cargo}</td><td style={s.td}>{ds.length>0?ds.map(d=>{const c=companies.find(c=>c.id===d.companyId);return<span key={d.id} style={{...s.badge(d.status),marginRight:4}}>{c?.name} {d.forklifts}대</span>}):<span style={{color:"#aaa",fontSize:12}}>미배차</span>}</td></tr>;})}</tbody>
              </table>
            }
          </div>
        </>}

        {isAdmin&&activeTab==="배차요청"&&<>
          <div style={s.row}><div style={s.sec}>배차 요청 관리</div><button style={{...s.btn,...s.btnP}} onClick={()=>setShowAddDispatch(!showAddDispatch)}>+ 배차 요청</button></div>
          {showAddDispatch&&<DispatchForm/>}
          {dispatches.map(d=><DispatchCard key={d.id} d={d} adminView/>)}
        </>}

        {isAdmin&&activeTab==="최종승인"&&<>
          <div style={s.sec}>업체 수락 완료 — 최종 승인 대기 ({needFinal}건)</div>
          {needFinal===0?<div style={{...s.card,color:"#aaa",fontSize:13,textAlign:"center" as const,padding:30}}>최종 승인할 항목이 없습니다.</div>:dispatches.filter(d=>d.status==="업체수락").map(d=><DispatchCard key={d.id} d={d} adminView/>)}
        </>}

        {isAdmin&&activeTab==="완료내역"&&<>
          <div style={s.sec}>배차 완료 내역 ({completed.length}건)</div>
          <div style={s.card}>
            <table style={s.table}>
              <thead><tr><th style={s.th}>날짜</th><th style={s.th}>선박</th><th style={s.th}>업체</th><th style={s.th}>지게차</th><th style={s.th}>업무시간</th><th style={s.th}>추가</th><th style={s.th}>금액</th></tr></thead>
              <tbody>{completed.map(d=>{const ship=ships.find(sh=>sh.id===d.shipId);const comp=companies.find(c=>c.id===d.companyId);return<tr key={d.id}><td style={s.td}>{d.date}</td><td style={s.td}>{ship?.name}</td><td style={s.td}>{comp?.name}</td><td style={s.td}>{d.forklifts}대</td><td style={s.td}>{d.startTime}~{d.endTime}</td><td style={s.td}>{d.extraHours}h</td><td style={{...s.td,fontWeight:600,color:"#1a3a5c"}}>{calcAmount(d).toLocaleString()}원</td></tr>;})}</tbody>
            </table>
            <div style={{marginTop:10,display:"flex",justifyContent:"flex-end",gap:20,fontSize:13,borderTop:"1px solid #eee",paddingTop:10}}>
              <span>총 건수: <b>{completed.length}건</b></span>
              <span>총 금액: <b style={{color:"#1a3a5c"}}>{completed.reduce((s,d)=>s+calcAmount(d),0).toLocaleString()}원</b></span>
            </div>
          </div>
        </>}

        {isAdmin&&activeTab==="입항계획"&&<>
          <div style={s.row}><div style={s.sec}>입항 예정 선박</div><button style={{...s.btn,...s.btnP}} onClick={()=>setShowAddShip(!showAddShip)}>+ 선박 추가</button></div>
          {showAddShip&&<div style={s.infoCard}>
            <div style={s.fgrid}>
              <div><label style={s.label}>선박명</label><input style={s.input} value={newShip.name} onChange={e=>setNewShip({...newShip,name:e.target.value})}/></div>
              <div><label style={s.label}>접안 부두</label><input style={s.input} value={newShip.berth} onChange={e=>setNewShip({...newShip,berth:e.target.value})}/></div>
              <div><label style={s.label}>입항 예정일</label><input style={s.input} type="date" value={newShip.eta} onChange={e=>setNewShip({...newShip,eta:e.target.value})}/></div>
              <div><label style={s.label}>화물 정보</label><input style={s.input} value={newShip.cargo} onChange={e=>setNewShip({...newShip,cargo:e.target.value})}/></div>
            </div>
            <button style={{...s.btn,...s.btnP}} onClick={addShip}>등록</button>
          </div>}
          {ships.map(sh=><div key={sh.id} style={s.card}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontWeight:700,fontSize:15,color:"#1a3a5c"}}>{sh.name}</div><div style={{fontSize:13,color:"#555",marginTop:4}}>{sh.cargo}</div></div><div style={{textAlign:"right" as const}}><div style={{fontWeight:600}}>{sh.eta}</div><div style={{fontSize:12,color:"#888"}}>{sh.berth}</div></div></div></div>)}
        </>}

        {isAdmin&&activeTab==="업체관리"&&<>
          <div style={s.sec}>협력업체 관리 ({companies.length}개사)</div>
          {companies.map(c=>(
            <div key={c.id} style={s.card}>
              {editingCompany?.id===c.id?(
                <div>
                  <div style={{fontWeight:600,fontSize:14,color:"#185FA5",marginBottom:10}}>업체 정보 수정</div>
                  <div style={s.fgrid}>
                    <div><label style={s.label}>회사명</label><input style={s.input} value={editingCompany.name} onChange={e=>setEditingCompany({...editingCompany,name:e.target.value})}/></div>
                    <div><label style={s.label}>담당자</label><input style={s.input} value={editingCompany.manager} onChange={e=>setEditingCompany({...editingCompany,manager:e.target.value})}/></div>
                    <div><label style={s.label}>연락처</label><input style={s.input} value={editingCompany.contact} onChange={e=>setEditingCompany({...editingCompany,contact:e.target.value})}/></div>
                    <div><label style={s.label}>이메일</label><input style={s.input} value={editingCompany.email||""} onChange={e=>setEditingCompany({...editingCompany,email:e.target.value})}/></div>
                    <div><label style={s.label}>사업자번호</label><input style={s.input} value={editingCompany.bizNo||""} onChange={e=>setEditingCompany({...editingCompany,bizNo:e.target.value})}/></div>
                    <div><label style={s.label}>보유 지게차(총)</label><input style={s.input} type="number" value={editingCompany.forklifts} onChange={e=>setEditingCompany({...editingCompany,forklifts:Number(e.target.value)})}/></div>
                  </div>
                  <div style={{marginBottom:10}}><label style={s.label}>주소</label><input style={s.input} value={editingCompany.address||""} onChange={e=>setEditingCompany({...editingCompany,address:e.target.value})}/></div>
                  <div style={{marginBottom:10}}>
                    <label style={s.label}>보유 차량 목록</label>
                    {editingCompany.vehicles.map((v:any,i:number)=>(
                      <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                        <input style={{...s.input,flex:2}} value={v.type} onChange={e=>{const vs=[...editingCompany.vehicles];vs[i]={...vs[i],type:e.target.value};setEditingCompany({...editingCompany,vehicles:vs});}} placeholder="차량 종류"/>
                        <input style={{...s.input,flex:1}} type="number" value={v.count} onChange={e=>{const vs=[...editingCompany.vehicles];vs[i]={...vs[i],count:Number(e.target.value)};setEditingCompany({...editingCompany,vehicles:vs});}} placeholder="대수"/>
                        <button style={{...s.btn,...s.btnD,padding:"4px 10px"}} onClick={()=>setEditingCompany({...editingCompany,vehicles:editingCompany.vehicles.filter((_:any,j:number)=>j!==i)})}>삭제</button>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8,marginTop:4}}>
                      <input style={{...s.input,flex:2}} value={newVehicle.type} onChange={e=>setNewVehicle({...newVehicle,type:e.target.value})} placeholder="차량 종류"/>
                      <input style={{...s.input,flex:1}} type="number" value={newVehicle.count} onChange={e=>setNewVehicle({...newVehicle,count:Number(e.target.value)})}/>
                      <button style={{...s.btn,background:"#E6F1FB",color:"#185FA5",padding:"4px 10px"}} onClick={()=>{if(!newVehicle.type)return;setEditingCompany({...editingCompany,vehicles:[...editingCompany.vehicles,{...newVehicle}]});setNewVehicle({type:"",count:1});}}>추가</button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}><button style={{...s.btn,...s.btnS}} onClick={saveCompany}>저장</button><button style={{...s.btn,...s.btnGray}} onClick={()=>setEditingCompany(null)}>취소</button></div>
                </div>
              ):(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{fontWeight:700,fontSize:15,color:"#1a3a5c"}}>{c.name}</div>
                    <button style={{...s.btn,background:"#f0f4fa",color:"#1a3a5c",padding:"4px 12px",fontSize:12}} onClick={()=>setEditingCompany({...c})}>수정</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,fontSize:13,color:"#555",marginBottom:8}}>
                    <div>담당자: <b>{c.manager}</b></div><div>연락처: <b>{c.contact}</b></div><div>이메일: <b>{c.email||"—"}</b></div>
                    <div>사업자번호: <b>{c.bizNo||"—"}</b></div><div>보유 지게차: <b>{c.forklifts}대</b></div><div>주소: <b>{c.address||"—"}</b></div>
                  </div>
                  {c.vehicles?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap" as const}}>{c.vehicles.map((v:any,i:number)=><span key={i} style={{fontSize:12,background:"#f0f4fa",color:"#1a3a5c",padding:"3px 10px",borderRadius:12,fontWeight:600}}>{v.type} {v.count}대</span>)}</div>}
                </div>
              )}
            </div>
          ))}
        </>}

        {!isAdmin&&activeTab==="내 업무현황"&&(()=>{
          const approved=myDispatches.filter((d:any)=>d.status==="승인완료");
          const waiting=myDispatches.filter((d:any)=>d.status==="요청중");
          const totalAmt=approved.reduce((s:number,d:any)=>s+calcAmount(d),0);
          const totalHrs=approved.reduce((s:number,d:any)=>s+9*d.forklifts+d.extraHours*d.forklifts,0);
          return<>
            <div style={s.infoCard}>
              <div style={{fontWeight:700,fontSize:16,color:"#185FA5",marginBottom:6}}>{myCompany?.name}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,fontSize:13,color:"#555"}}>
                <div>담당자: <b>{myCompany?.manager}</b></div><div>연락처: <b>{myCompany?.contact}</b></div><div>보유 지게차: <b>{myCompany?.forklifts}대</b></div>
              </div>
            </div>
            <div style={{...s.metricGrid,gridTemplateColumns:"repeat(3,1fr)"}}>
              <div style={s.metric}><div style={s.metricVal}>{waiting.length}</div><div style={s.metricLbl}>수락 대기</div></div>
              <div style={s.metric}><div style={s.metricVal}>{totalHrs}</div><div style={s.metricLbl}>완료 업무시간(h)</div></div>
              <div style={s.metric}><div style={s.metricVal}>{(totalAmt/10000).toFixed(0)}만원</div><div style={s.metricLbl}>완료 금액</div></div>
            </div>
            {waiting.length>0&&<><div style={s.sec}>수락 대기 중인 배차 요청 ({waiting.length}건)</div>{waiting.map((d:any)=><DispatchCard key={d.id} d={d} companyView/>)}</>}
          </>;
        })()}

        {!isAdmin&&activeTab==="배차 수락/거절"&&<>
          <div style={s.sec}>배차 요청 목록</div>
          {myDispatches.length===0?<div style={{...s.card,color:"#aaa",fontSize:13}}>배차 요청이 없습니다.</div>:myDispatches.map((d:any)=><DispatchCard key={d.id} d={d} companyView/>)}
        </>}

        {!isAdmin&&activeTab==="업무기록"&&<>
          <div style={s.sec}>{myCompany?.name} 업무 기록</div>
          {myDispatches.length===0?<div style={{color:"#aaa",fontSize:14}}>업무 기록이 없습니다.</div>:<div style={s.card}>
            <table style={s.table}>
              <thead><tr><th style={s.th}>날짜</th><th style={s.th}>선박</th><th style={s.th}>부두</th><th style={s.th}>지게차</th><th style={s.th}>업무시간</th><th style={s.th}>추가</th><th style={s.th}>금액</th><th style={s.th}>상태</th></tr></thead>
              <tbody>{myDispatches.map((d:any)=>{const ship=ships.find(sh=>sh.id===d.shipId);return<tr key={d.id}><td style={s.td}>{d.date}</td><td style={s.td}>{ship?.name}</td><td style={s.td}>{ship?.berth}</td><td style={s.td}>{d.forklifts}대</td><td style={s.td}>{d.startTime}~{d.endTime}</td><td style={s.td}>{d.extraHours}h</td><td style={{...s.td,fontWeight:600,color:"#1a3a5c"}}>{calcAmount(d).toLocaleString()}원</td><td style={s.td}><span style={s.badge(d.status)}>{d.status}</span></td></tr>;})}</tbody>
            </table>
            <div style={{marginTop:10,display:"flex",justifyContent:"flex-end",gap:20,fontSize:13,borderTop:"1px solid #eee",paddingTop:10}}>
              <span>총 건수: <b>{myDispatches.length}건</b></span>
              <span>총 금액: <b style={{color:"#1a3a5c"}}>{myDispatches.reduce((s:number,d:any)=>s+calcAmount(d),0).toLocaleString()}원</b></span>
            </div>
          </div>}
        </>}

        {!isAdmin&&activeTab==="업체정보"&&(()=>{
          const c = editingCompany || myCompany;
          const isEditing = !!editingCompany;
          return<>
            <div style={s.row}><div style={s.sec}>업체 정보</div>{!isEditing&&<button style={{...s.btn,...s.btnP}} onClick={()=>setEditingCompany({...myCompany})}>수정</button>}</div>
            {isEditing?(
              <div style={s.card}>
                <div style={s.fgrid}>
                  <div><label style={s.label}>회사명</label><input style={s.input} value={editingCompany.name} onChange={e=>setEditingCompany({...editingCompany,name:e.target.value})}/></div>
                  <div><label style={s.label}>담당자</label><input style={s.input} value={editingCompany.manager} onChange={e=>setEditingCompany({...editingCompany,manager:e.target.value})}/></div>
                  <div><label style={s.label}>연락처</label><input style={s.input} value={editingCompany.contact} onChange={e=>setEditingCompany({...editingCompany,contact:e.target.value})}/></div>
                  <div><label style={s.label}>이메일</label><input style={s.input} value={editingCompany.email||""} onChange={e=>setEditingCompany({...editingCompany,email:e.target.value})}/></div>
                  <div><label style={s.label}>사업자번호</label><input style={s.input} value={editingCompany.bizNo||""} onChange={e=>setEditingCompany({...editingCompany,bizNo:e.target.value})}/></div>
                  <div><label style={s.label}>보유 지게차(총)</label><input style={s.input} type="number" value={editingCompany.forklifts} onChange={e=>setEditingCompany({...editingCompany,forklifts:Number(e.target.value)})}/></div>
                </div>
                <div style={{marginBottom:10}}><label style={s.label}>주소</label><input style={s.input} value={editingCompany.address||""} onChange={e=>setEditingCompany({...editingCompany,address:e.target.value})}/></div>
                <div style={{marginBottom:10}}>
                  <label style={s.label}>보유 차량 목록</label>
                  {editingCompany.vehicles.map((v:any,i:number)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                      <input style={{...s.input,flex:2}} value={v.type} onChange={e=>{const vs=[...editingCompany.vehicles];vs[i]={...vs[i],type:e.target.value};setEditingCompany({...editingCompany,vehicles:vs});}} placeholder="차량 종류"/>
                      <input style={{...s.input,flex:1}} type="number" value={v.count} onChange={e=>{const vs=[...editingCompany.vehicles];vs[i]={...vs[i],count:Number(e.target.value)};setEditingCompany({...editingCompany,vehicles:vs});}} placeholder="대수"/>
                      <button style={{...s.btn,...s.btnD,padding:"4px 10px"}} onClick={()=>setEditingCompany({...editingCompany,vehicles:editingCompany.vehicles.filter((_:any,j:number)=>j!==i)})}>삭제</button>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <input style={{...s.input,flex:2}} value={newVehicle.type} onChange={e=>setNewVehicle({...newVehicle,type:e.target.value})} placeholder="차량 종류"/>
                    <input style={{...s.input,flex:1}} type="number" value={newVehicle.count} onChange={e=>setNewVehicle({...newVehicle,count:Number(e.target.value)})}/>
                    <button style={{...s.btn,background:"#E6F1FB",color:"#185FA5",padding:"4px 10px"}} onClick={()=>{if(!newVehicle.type)return;setEditingCompany({...editingCompany,vehicles:[...editingCompany.vehicles,{...newVehicle}]});setNewVehicle({type:"",count:1});}}>추가</button>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}><button style={{...s.btn,...s.btnS}} onClick={saveCompany}>저장</button><button style={{...s.btn,...s.btnGray}} onClick={()=>setEditingCompany(null)}>취소</button></div>
              </div>
            ):(
              <div style={s.card}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,fontSize:14,marginBottom:14}}>
                  {[["회사명",c?.name],["담당자",c?.manager],["연락처",c?.contact],["이메일",c?.email||"—"],["사업자번호",c?.bizNo||"—"],["보유 지게차",`${c?.forklifts}대`]].map(([label,val])=>(
                    <div key={label} style={{background:"#f8f9fa",padding:"10px 14px",borderRadius:8}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>{label}</div><b>{val}</b></div>
                  ))}
                  <div style={{background:"#f8f9fa",padding:"10px 14px",borderRadius:8,gridColumn:"span 2"}}><div style={{fontSize:11,color:"#888",marginBottom:3}}>주소</div><b>{c?.address||"—"}</b></div>
                </div>
                {c?.vehicles?.length>0&&<><div style={{fontSize:13,fontWeight:600,color:"#444",marginBottom:8}}>보유 차량</div><div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>{c.vehicles.map((v:any,i:number)=><div key={i} style={{background:"#f0f4fa",borderRadius:8,padding:"8px 14px",textAlign:"center" as const}}><div style={{fontSize:13,fontWeight:700,color:"#1a3a5c"}}>{v.count}대</div><div style={{fontSize:12,color:"#666"}}>{v.type}</div></div>)}</div></>}
              </div>
            )}
          </>;
        })()}

        {activeTab==="월별정산"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={s.sec}>월별 정산</div>
            <input type="month" style={{...s.input,width:"auto"}} value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}/>
          </div>
          {monthlyData.map((c:any)=><div key={c.id} style={s.card}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontWeight:700,fontSize:15,color:"#1a3a5c"}}>{c.name}</div>
              <div style={{fontWeight:700,color:c.total>0?"#3B6D11":"#999"}}>{c.total>0?c.total.toLocaleString()+"원":"—"}</div>
            </div>
            {c.items.length===0?<div style={{color:"#aaa",fontSize:13}}>해당 월 배차 내역 없음</div>:<table style={s.table}>
              <thead><tr><th style={s.th}>날짜</th><th style={s.th}>선박</th><th style={s.th}>지게차</th><th style={s.th}>총 시간(h)</th><th style={s.th}>금액</th><th style={s.th}>상태</th></tr></thead>
              <tbody>{c.items.map((d:any)=>{const ship=ships.find((sh:any)=>sh.id===d.shipId);return<tr key={d.id}><td style={s.td}>{d.date}</td><td style={s.td}>{ship?.name}</td><td style={s.td}>{d.forklifts}대</td><td style={s.td}>{9*d.forklifts+d.extraHours*d.forklifts}h</td><td style={{...s.td,fontWeight:600}}>{calcAmount(d).toLocaleString()}원</td><td style={s.td}><span style={s.badge(d.status)}>{d.status}</span></td></tr>;})}</tbody>
            </table>}
            <div style={{marginTop:8,fontSize:13,color:"#666"}}>총 업무시간: <b>{c.hrs}h</b></div>
          </div>)}
          <div style={{...s.card,background:"#f0f4fa",textAlign:"center" as const}}>
            <div style={{fontSize:13,color:"#666",marginBottom:4}}>{selectedMonth} {isAdmin?"전체":"내"} 합계</div>
            <div style={{fontSize:26,fontWeight:700,color:"#1a3a5c"}}>{monthlyData.reduce((s:number,c:any)=>s+c.total,0).toLocaleString()}원</div>
          </div>
        </>}

      </div>
    </div>
  );
}