import { useState } from 'react';

const COMPANIES = [
  { id: 1, name: '한진물류', contact: '010-1234-5678', forklifts: 6 },
  { id: 2, name: '대한운수', contact: '010-2345-6789', forklifts: 4 },
  { id: 3, name: '현대항운', contact: '010-3456-7890', forklifts: 8 },
];

const USERS = [
  { id: 0, name: '관리자', role: 'admin', companyId: null },
  { id: 1, name: '한진물류 담당자', role: 'company', companyId: 1 },
  { id: 2, name: '대한운수 담당자', role: 'company', companyId: 2 },
  { id: 3, name: '현대항운 담당자', role: 'company', companyId: 3 },
];

const INIT_SHIPS = [
  {
    id: 1,
    name: '현대 마리나호',
    berth: '3부두',
    eta: '2026-04-03',
    cargo: '컨테이너 240TEU',
  },
  {
    id: 2,
    name: '대한 스타호',
    berth: '1부두',
    eta: '2026-04-05',
    cargo: '자동차 부품',
  },
  {
    id: 3,
    name: '진영 오션호',
    berth: '2부두',
    eta: '2026-04-07',
    cargo: '철강재',
  },
];

const INIT_DISPATCH = [
  {
    id: 1,
    shipId: 1,
    companyId: 1,
    forklifts: 4,
    startTime: '08:00',
    endTime: '17:00',
    extraHours: 2,
    status: '승인완료',
    date: '2026-04-03',
    unitPrice: 50000,
    rejectReason: '',
    companyNote: '',
  },
  {
    id: 2,
    shipId: 2,
    companyId: 2,
    forklifts: 3,
    startTime: '09:00',
    endTime: '18:00',
    extraHours: 0,
    status: '요청중',
    date: '2026-04-05',
    unitPrice: 50000,
    rejectReason: '',
    companyNote: '',
  },
  {
    id: 3,
    shipId: 3,
    companyId: 3,
    forklifts: 5,
    startTime: '07:00',
    endTime: '16:00',
    extraHours: 3,
    status: '요청중',
    date: '2026-04-07',
    unitPrice: 50000,
    rejectReason: '',
    companyNote: '',
  },
  {
    id: 4,
    shipId: 1,
    companyId: 1,
    forklifts: 2,
    startTime: '08:00',
    endTime: '17:00',
    extraHours: 1,
    status: '승인완료',
    date: '2026-03-15',
    unitPrice: 50000,
    rejectReason: '',
    companyNote: '',
  },
  {
    id: 5,
    shipId: 2,
    companyId: 3,
    forklifts: 3,
    startTime: '07:00',
    endTime: '16:00',
    extraHours: 0,
    status: '업체수락',
    date: '2026-03-20',
    unitPrice: 50000,
    rejectReason: '',
    companyNote: '작업 준비 완료',
  },
  {
    id: 6,
    shipId: 1,
    companyId: 2,
    forklifts: 2,
    startTime: '10:00',
    endTime: '19:00',
    extraHours: 1,
    status: '요청중',
    date: '2026-04-03',
    unitPrice: 50000,
    rejectReason: '',
    companyNote: '',
  },
];

const STATUS_STYLE = {
  요청중: { bg: '#E6F1FB', color: '#185FA5' },
  업체수락: { bg: '#EEEDFE', color: '#534AB7' },
  승인완료: { bg: '#EAF3DE', color: '#3B6D11' },
  업체거절: { bg: '#FCEBEB', color: '#A32D2D' },
  취소: { bg: '#F1EFE8', color: '#5F5E5A' },
};

const FLOW_STEPS = [
  { label: '① 관리자 배차요청', color: '#185FA5' },
  { label: '② 업체 수락', color: '#534AB7' },
  { label: '③ 관리자 최종승인', color: '#3B6D11' },
];

const ADMIN_TABS = [
  '대시보드',
  '일간계획표',
  '배차요청',
  '최종승인',
  '완료내역',
  '입항계획',
  '월별정산',
];
const COMPANY_TABS = ['내 업무현황', '배차 수락/거절', '업무기록', '월별정산'];

const calcAmount = (d) => {
  const base = 9 * d.forklifts * d.unitPrice;
  const extra = d.extraHours * d.forklifts * Math.round(d.unitPrice * 1.5);
  return base + extra;
};

const today = new Date().toISOString().split('T')[0];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [ships, setShips] = useState(INIT_SHIPS);
  const [dispatches, setDispatches] = useState(INIT_DISPATCH);
  const [planDate, setPlanDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [showAddShip, setShowAddShip] = useState(false);
  const [showAddDispatch, setShowAddDispatch] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [newShip, setNewShip] = useState({
    name: '',
    berth: '',
    eta: '',
    cargo: '',
  });
  const [newDispatch, setNewDispatch] = useState({
    shipId: '',
    companyId: '',
    forklifts: 2,
    startTime: '08:00',
    endTime: '17:00',
    extraHours: 0,
    unitPrice: 50000,
  });

  const login = (u) => {
    setCurrentUser(u);
    setActiveTab(u.role === 'admin' ? '대시보드' : '내 업무현황');
  };
  const logout = () => {
    setCurrentUser(null);
    setActiveTab('');
  };

  const setStatus = (id, status, extra = {}) =>
    setDispatches((ds) =>
      ds.map((d) => (d.id === id ? { ...d, status, ...extra } : d))
    );

  const addShip = () => {
    if (!newShip.name || !newShip.eta) return;
    setShips([...ships, { id: ships.length + 1, ...newShip }]);
    setNewShip({ name: '', berth: '', eta: '', cargo: '' });
    setShowAddShip(false);
  };

  const addDispatch = () => {
    if (!newDispatch.shipId || !newDispatch.companyId) return;
    const ship = ships.find((s) => s.id === Number(newDispatch.shipId));
    setDispatches([
      ...dispatches,
      {
        id: dispatches.length + 1,
        ...newDispatch,
        shipId: Number(newDispatch.shipId),
        companyId: Number(newDispatch.companyId),
        forklifts: Number(newDispatch.forklifts),
        extraHours: Number(newDispatch.extraHours),
        unitPrice: Number(newDispatch.unitPrice),
        status: '요청중',
        date: ship?.eta || '',
        rejectReason: '',
        companyNote: '',
      },
    ]);
    setNewDispatch({
      shipId: '',
      companyId: '',
      forklifts: 2,
      startTime: '08:00',
      endTime: '17:00',
      extraHours: 0,
      unitPrice: 50000,
    });
    setShowAddDispatch(false);
  };

  const s = {
    wrap: {
      fontFamily: 'sans-serif',
      maxWidth: 940,
      margin: '0 auto',
      paddingBottom: '2rem',
    },
    header: {
      background: '#1a3a5c',
      color: '#fff',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '10px 10px 0 0',
    },
    tabBar: {
      display: 'flex',
      borderBottom: '1px solid #e0e0e0',
      background: '#f8f9fa',
      flexWrap: 'wrap',
    },
    tab: (a) => ({
      padding: '9px 15px',
      fontSize: 13,
      cursor: 'pointer',
      border: 'none',
      background: a ? '#fff' : 'transparent',
      color: a ? '#1a3a5c' : '#666',
      fontWeight: a ? 700 : 400,
      borderBottom: a ? '2px solid #1a3a5c' : '2px solid transparent',
    }),
    body: { padding: '20px' },
    card: {
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: 10,
      padding: '16px',
      marginBottom: 14,
    },
    infoCard: {
      background: '#f8fbff',
      border: '1px solid #b5d4f4',
      borderRadius: 10,
      padding: '16px',
      marginBottom: 14,
    },
    metricGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 12,
      marginBottom: 20,
    },
    metric: {
      background: '#f0f4fa',
      borderRadius: 8,
      padding: '14px 16px',
      textAlign: 'center',
    },
    metricVal: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
    metricLbl: { fontSize: 12, color: '#666', marginTop: 2 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: {
      background: '#f0f4fa',
      padding: '8px 10px',
      textAlign: 'left',
      color: '#444',
      fontWeight: 600,
      borderBottom: '1px solid #e0e0e0',
    },
    td: {
      padding: '8px 10px',
      borderBottom: '1px solid #f0f0f0',
      verticalAlign: 'middle',
    },
    badge: (st) => ({
      ...(STATUS_STYLE[st] || { bg: '#eee', color: '#555' }),
      padding: '2px 9px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      display: 'inline-block',
    }),
    btn: {
      padding: '7px 16px',
      borderRadius: 7,
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
    },
    btnP: { background: '#1a3a5c', color: '#fff' },
    btnS: { background: '#3B6D11', color: '#fff' },
    btnD: { background: '#A32D2D', color: '#fff' },
    btnPurple: { background: '#534AB7', color: '#fff' },
    input: {
      padding: '7px 10px',
      border: '1px solid #ddd',
      borderRadius: 7,
      fontSize: 13,
      width: '100%',
      boxSizing: 'border-box',
    },
    label: { fontSize: 12, color: '#555', marginBottom: 3, display: 'block' },
    fgrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 10,
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    sec: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 12 },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
    },
    modal: {
      background: '#fff',
      borderRadius: 12,
      padding: '24px',
      width: 360,
      maxWidth: '90%',
    },
  };

  const DispatchCard = ({ d, adminView = false, companyView = false }) => {
    const ship = ships.find((sh) => sh.id === d.shipId);
    const comp = COMPANIES.find((c) => c.id === d.companyId);
    const [note, setNote] = useState('');
    const borderColor =
      d.status === '승인완료'
        ? '#3B6D11'
        : d.status === '업체거절' || d.status === '취소'
        ? '#ccc'
        : d.status === '업체수락'
        ? '#534AB7'
        : '#378ADD';
    return (
      <div style={{ ...s.card, borderLeft: `4px solid ${borderColor}` }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14 }}>{ship?.name}</span>
            {adminView && (
              <span style={{ fontSize: 13, color: '#555' }}>{comp?.name}</span>
            )}
            <span style={{ fontSize: 12, color: '#888' }}>{ship?.berth}</span>
          </div>
          <span style={s.badge(d.status)}>{d.status}</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 6,
            fontSize: 13,
            color: '#555',
            marginBottom: 10,
            background: '#f8f9fa',
            padding: '10px 12px',
            borderRadius: 8,
          }}
        >
          <div>
            날짜: <b>{d.date}</b>
          </div>
          <div>
            지게차: <b>{d.forklifts}대</b>
          </div>
          <div>
            단가: <b>{d.unitPrice.toLocaleString()}원</b>
          </div>
          <div>
            업무:{' '}
            <b>
              {d.startTime}~{d.endTime}
            </b>
          </div>
          <div>
            추가: <b>{d.extraHours}h</b>
          </div>
          <div>
            금액:{' '}
            <b style={{ color: '#1a3a5c' }}>
              {calcAmount(d).toLocaleString()}원
            </b>
          </div>
        </div>
        {d.companyNote && (
          <div
            style={{
              fontSize: 12,
              color: '#534AB7',
              background: '#EEEDFE',
              padding: '6px 10px',
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            업체 메모: {d.companyNote}
          </div>
        )}
        {d.rejectReason && (
          <div
            style={{
              fontSize: 12,
              color: '#A32D2D',
              background: '#FCEBEB',
              padding: '6px 10px',
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            거절 사유: {d.rejectReason}
          </div>
        )}
        {adminView && d.status === '업체수락' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{ ...s.btn, ...s.btnS }}
              onClick={() => setStatus(d.id, '승인완료')}
            >
              최종 승인
            </button>
            <button
              style={{ ...s.btn, ...s.btnD }}
              onClick={() => {
                setRejectModal({ id: d.id });
                setRejectReason('');
              }}
            >
              취소
            </button>
          </div>
        )}
        {adminView && d.status === '요청중' && (
          <button
            style={{ ...s.btn, background: '#f0f0f0', color: '#666' }}
            onClick={() => setStatus(d.id, '취소')}
          >
            요청 취소
          </button>
        )}
        {companyView && d.status === '요청중' && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <label style={s.label}>메모 (선택)</label>
              <input
                style={s.input}
                placeholder="메모 입력 후 수락"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ ...s.btn, ...s.btnPurple }}
                onClick={() =>
                  setStatus(d.id, '업체수락', { companyNote: note })
                }
              >
                수락
              </button>
              <button
                style={{ ...s.btn, ...s.btnD }}
                onClick={() => {
                  setRejectModal({ id: d.id });
                  setRejectReason('');
                }}
              >
                거절
              </button>
            </div>
          </div>
        )}
        {companyView && d.status === '업체수락' && (
          <div
            style={{
              fontSize: 13,
              color: '#534AB7',
              background: '#EEEDFE',
              padding: '8px 12px',
              borderRadius: 7,
            }}
          >
            수락 완료 — 관리자 최종 승인 대기 중입니다.
          </div>
        )}
      </div>
    );
  };

  const DispatchForm = () => (
    <div style={s.infoCard}>
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          color: '#185FA5',
          marginBottom: 10,
        }}
      >
        배차 요청 등록
      </div>
      <div style={s.fgrid}>
        <div>
          <label style={s.label}>선박</label>
          <select
            style={s.input}
            value={newDispatch.shipId}
            onChange={(e) =>
              setNewDispatch({ ...newDispatch, shipId: e.target.value })
            }
          >
            <option value="">선택</option>
            {ships.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.name} ({sh.eta})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={s.label}>협력업체</label>
          <select
            style={s.input}
            value={newDispatch.companyId}
            onChange={(e) =>
              setNewDispatch({ ...newDispatch, companyId: e.target.value })
            }
          >
            <option value="">선택</option>
            {COMPANIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (보유 {c.forklifts}대)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={s.label}>지게차 대수</label>
          <input
            style={s.input}
            type="number"
            min="1"
            value={newDispatch.forklifts}
            onChange={(e) =>
              setNewDispatch({ ...newDispatch, forklifts: e.target.value })
            }
          />
        </div>
        <div>
          <label style={s.label}>단가(원/h/대)</label>
          <input
            style={s.input}
            type="number"
            value={newDispatch.unitPrice}
            onChange={(e) =>
              setNewDispatch({ ...newDispatch, unitPrice: e.target.value })
            }
          />
        </div>
        <div>
          <label style={s.label}>시작 시간</label>
          <input
            style={s.input}
            type="time"
            value={newDispatch.startTime}
            onChange={(e) =>
              setNewDispatch({ ...newDispatch, startTime: e.target.value })
            }
          />
        </div>
        <div>
          <label style={s.label}>종료 시간</label>
          <input
            style={s.input}
            type="time"
            value={newDispatch.endTime}
            onChange={(e) =>
              setNewDispatch({ ...newDispatch, endTime: e.target.value })
            }
          />
        </div>
        <div>
          <label style={s.label}>추가 근무(h)</label>
          <input
            style={s.input}
            type="number"
            min="0"
            value={newDispatch.extraHours}
            onChange={(e) =>
              setNewDispatch({ ...newDispatch, extraHours: e.target.value })
            }
          />
        </div>
      </div>
      <button style={{ ...s.btn, ...s.btnP }} onClick={addDispatch}>
        요청 전송
      </button>
    </div>
  );

  if (!currentUser)
    return (
      <div style={s.wrap}>
        <div style={s.header}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>
              항구 지게차 배차 관리 시스템
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
              계정을 선택하여 로그인하세요
            </div>
          </div>
        </div>
        <div style={{ padding: '20px 20px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 4,
              background: '#f8f9fa',
              borderRadius: 10,
              padding: '14px 20px',
              border: '1px solid #e8e8e8',
            }}
          >
            {FLOW_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: step.color,
                    background: '#fff',
                    border: `1px solid ${step.color}`,
                    borderRadius: 20,
                    padding: '4px 14px',
                  }}
                >
                  {step.label}
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div style={{ fontSize: 16, color: '#bbb', margin: '0 6px' }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...s.body, maxWidth: 460, margin: '20px auto' }}>
          <div style={{ ...s.card, padding: 24 }}>
            <div style={{ ...s.sec, marginBottom: 18 }}>로그인</div>
            {USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => login(u)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  marginBottom: 10,
                  borderRadius: 9,
                  border: '1px solid #dde4f0',
                  background: u.role === 'admin' ? '#f0f4fa' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 14, color: '#1a3a5c' }}
                  >
                    {u.name}
                  </div>
                  {u.companyId && (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {COMPANIES.find((c) => c.id === u.companyId)?.contact}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: u.role === 'admin' ? '#1a3a5c' : '#E6F1FB',
                    color: u.role === 'admin' ? '#fff' : '#185FA5',
                    fontWeight: 600,
                  }}
                >
                  {u.role === 'admin' ? '관리자' : '협력업체'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  const isAdmin = currentUser.role === 'admin';
  const tabs = isAdmin ? ADMIN_TABS : COMPANY_TABS;
  const myDispatches = isAdmin
    ? dispatches
    : dispatches.filter((d) => d.companyId === currentUser.companyId);
  const myCompany = isAdmin
    ? null
    : COMPANIES.find((c) => c.id === currentUser.companyId);
  const needFinalApproval = dispatches.filter(
    (d) => d.status === '업체수락'
  ).length;
  const needCompanyAction = myDispatches.filter(
    (d) => d.status === '요청중'
  ).length;
  const planDispatches = dispatches.filter((d) => d.date === planDate);
  const completed = dispatches.filter((d) => d.status === '승인완료');

  const monthlyData = isAdmin
    ? COMPANIES.map((c) => {
        const items = dispatches.filter(
          (d) => d.companyId === c.id && d.date.startsWith(selectedMonth)
        );
        return {
          ...c,
          items,
          total: items.reduce((s, d) => s + calcAmount(d), 0),
          hrs: items.reduce(
            (s, d) => s + 9 * d.forklifts + d.extraHours * d.forklifts,
            0
          ),
        };
      })
    : (() => {
        const items = myDispatches.filter((d) =>
          d.date.startsWith(selectedMonth)
        );
        return [
          {
            ...myCompany,
            items,
            total: items.reduce((s, d) => s + calcAmount(d), 0),
            hrs: items.reduce(
              (s, d) => s + 9 * d.forklifts + d.extraHours * d.forklifts,
              0
            ),
          },
        ];
      })();

  return (
    <div style={s.wrap}>
      {rejectModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 12,
                color: '#1a3a5c',
              }}
            >
              {isAdmin ? '요청 취소 사유' : '거절 사유'}
            </div>
            <textarea
              style={{ ...s.input, height: 80, resize: 'vertical' }}
              placeholder="사유를 입력하세요"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 12,
                justifyContent: 'flex-end',
              }}
            >
              <button
                style={{ ...s.btn, background: '#eee', color: '#555' }}
                onClick={() => setRejectModal(null)}
              >
                닫기
              </button>
              <button
                style={{ ...s.btn, ...s.btnD }}
                onClick={() => {
                  setStatus(rejectModal.id, isAdmin ? '취소' : '업체거절', {
                    rejectReason,
                  });
                  setRejectModal(null);
                  setRejectReason('');
                }}
              >
                확정
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={s.header}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>
            항구 지게차 배차 관리 시스템
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
            {currentUser.name} 로그인 중
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            ...s.btn,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          로그아웃
        </button>
      </div>
      <div style={s.tabBar}>
        {tabs.map((t) => {
          const badge =
            t === '최종승인'
              ? needFinalApproval
              : t === '배차 수락/거절'
              ? needCompanyAction
              : 0;
          return (
            <button
              key={t}
              style={s.tab(activeTab === t)}
              onClick={() => setActiveTab(t)}
            >
              {t}
              {badge > 0 && (
                <span
                  style={{
                    marginLeft: 5,
                    background: '#E24B4A',
                    color: '#fff',
                    borderRadius: 10,
                    fontSize: 11,
                    padding: '1px 6px',
                    fontWeight: 700,
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div style={s.body}>
        {isAdmin && activeTab === '대시보드' && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 4,
                marginBottom: 20,
                background: '#f8f9fa',
                borderRadius: 10,
                padding: '12px 16px',
                border: '1px solid #e0e0e0',
              }}
            >
              {FLOW_STEPS.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: step.color,
                      background: '#fff',
                      border: `1px solid ${step.color}`,
                      borderRadius: 20,
                      padding: '3px 12px',
                    }}
                  >
                    {step.label}
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div
                      style={{ fontSize: 16, color: '#bbb', margin: '0 4px' }}
                    >
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={s.metricGrid}>
              <div style={s.metric}>
                <div style={s.metricVal}>
                  {dispatches.filter((d) => d.status === '요청중').length}
                </div>
                <div style={s.metricLbl}>업체 응답 대기</div>
              </div>
              <div style={s.metric}>
                <div style={s.metricVal}>{needFinalApproval}</div>
                <div style={s.metricLbl}>최종승인 대기</div>
              </div>
              <div style={s.metric}>
                <div style={s.metricVal}>{completed.length}</div>
                <div style={s.metricLbl}>완료 배차</div>
              </div>
            </div>
            {needFinalApproval > 0 && (
              <>
                <div style={s.sec}>최종 승인 필요 ({needFinalApproval}건)</div>
                {dispatches
                  .filter((d) => d.status === '업체수락')
                  .map((d) => (
                    <DispatchCard key={d.id} d={d} adminView />
                  ))}
              </>
            )}
            <div
              style={{
                ...s.card,
                background: '#f0f4fa',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                승인완료 금액 합계
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>
                {completed
                  .reduce((s, d) => s + calcAmount(d), 0)
                  .toLocaleString()}
                원
              </div>
            </div>
          </>
        )}

        {isAdmin && activeTab === '일간계획표' && (
          <>
            <div style={s.row}>
              <div style={s.sec}>일간 배차 계획표</div>
              <input
                type="date"
                style={{ ...s.input, width: 'auto' }}
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
              />
            </div>
            <div style={s.infoCard}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#185FA5',
                  marginBottom: 8,
                }}
              >
                입항 선박
              </div>
              {ships.filter((sh) => sh.eta === planDate).length === 0 ? (
                <div style={{ fontSize: 13, color: '#aaa' }}>
                  해당일 입항 선박 없음
                </div>
              ) : (
                ships
                  .filter((sh) => sh.eta === planDate)
                  .map((sh) => (
                    <div
                      key={sh.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        padding: '5px 0',
                        borderBottom: '1px solid #e0eaf5',
                      }}
                    >
                      <b>{sh.name}</b>
                      <span style={{ color: '#555' }}>
                        {sh.berth} · {sh.cargo}
                      </span>
                    </div>
                  ))
              )}
            </div>
            {planDispatches.length > 0 ? (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,1fr)',
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  {COMPANIES.map((c) => {
                    const items = planDispatches.filter(
                      (d) => d.companyId === c.id
                    );
                    return (
                      <div
                        key={c.id}
                        style={{
                          ...s.metric,
                          background: items.length > 0 ? '#f0f4fa' : '#fafafa',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#1a3a5c',
                            marginBottom: 4,
                          }}
                        >
                          {c.name}
                        </div>
                        <div style={s.metricVal}>
                          {items.reduce((s, d) => s + d.forklifts, 0)}대
                        </div>
                        <div style={s.metricLbl}>{items.length}건</div>
                      </div>
                    );
                  })}
                </div>
                <div style={s.card}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>선박</th>
                        <th style={s.th}>업체</th>
                        <th style={s.th}>지게차</th>
                        <th style={s.th}>업무시간</th>
                        <th style={s.th}>추가</th>
                        <th style={s.th}>금액</th>
                        <th style={s.th}>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planDispatches.map((d) => {
                        const ship = ships.find((sh) => sh.id === d.shipId);
                        const comp = COMPANIES.find(
                          (c) => c.id === d.companyId
                        );
                        return (
                          <tr key={d.id}>
                            <td style={s.td}>{ship?.name}</td>
                            <td style={s.td}>{comp?.name}</td>
                            <td style={s.td}>{d.forklifts}대</td>
                            <td style={s.td}>
                              {d.startTime}~{d.endTime}
                            </td>
                            <td style={s.td}>{d.extraHours}h</td>
                            <td
                              style={{
                                ...s.td,
                                fontWeight: 600,
                                color: '#1a3a5c',
                              }}
                            >
                              {calcAmount(d).toLocaleString()}원
                            </td>
                            <td style={s.td}>
                              <span style={s.badge(d.status)}>{d.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 20,
                      fontSize: 13,
                      borderTop: '1px solid #eee',
                      paddingTop: 10,
                    }}
                  >
                    <span>
                      총 지게차:{' '}
                      <b>
                        {planDispatches.reduce((s, d) => s + d.forklifts, 0)}대
                      </b>
                    </span>
                    <span>
                      총 금액:{' '}
                      <b style={{ color: '#1a3a5c' }}>
                        {planDispatches
                          .reduce((s, d) => s + calcAmount(d), 0)
                          .toLocaleString()}
                        원
                      </b>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ ...s.card, color: '#aaa', fontSize: 13 }}>
                해당일 배차 내역이 없습니다.
              </div>
            )}
            <div style={s.row}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#444' }}>
                배차 요청 추가
              </div>
              <button
                style={{ ...s.btn, ...s.btnP }}
                onClick={() => setShowAddDispatch(!showAddDispatch)}
              >
                + 배차 요청
              </button>
            </div>
            {showAddDispatch && <DispatchForm />}
          </>
        )}

        {isAdmin && activeTab === '배차요청' && (
          <>
            <div style={s.row}>
              <div style={s.sec}>배차 요청 관리</div>
              <button
                style={{ ...s.btn, ...s.btnP }}
                onClick={() => setShowAddDispatch(!showAddDispatch)}
              >
                + 배차 요청
              </button>
            </div>
            {showAddDispatch && <DispatchForm />}
            {dispatches.map((d) => (
              <DispatchCard key={d.id} d={d} adminView />
            ))}
          </>
        )}

        {isAdmin && activeTab === '최종승인' && (
          <>
            <div style={s.sec}>
              업체 수락 완료 — 최종 승인 대기 ({needFinalApproval}건)
            </div>
            {needFinalApproval === 0 ? (
              <div
                style={{
                  ...s.card,
                  color: '#aaa',
                  fontSize: 13,
                  textAlign: 'center',
                  padding: 30,
                }}
              >
                최종 승인할 항목이 없습니다.
              </div>
            ) : (
              dispatches
                .filter((d) => d.status === '업체수락')
                .map((d) => <DispatchCard key={d.id} d={d} adminView />)
            )}
          </>
        )}

        {isAdmin && activeTab === '완료내역' && (
          <>
            <div style={s.sec}>배차 완료 내역 ({completed.length}건)</div>
            <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>날짜</th>
                    <th style={s.th}>선박</th>
                    <th style={s.th}>업체</th>
                    <th style={s.th}>지게차</th>
                    <th style={s.th}>업무시간</th>
                    <th style={s.th}>추가</th>
                    <th style={s.th}>금액</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((d) => {
                    const ship = ships.find((sh) => sh.id === d.shipId);
                    const comp = COMPANIES.find((c) => c.id === d.companyId);
                    return (
                      <tr key={d.id}>
                        <td style={s.td}>{d.date}</td>
                        <td style={s.td}>{ship?.name}</td>
                        <td style={s.td}>{comp?.name}</td>
                        <td style={s.td}>{d.forklifts}대</td>
                        <td style={s.td}>
                          {d.startTime}~{d.endTime}
                        </td>
                        <td style={s.td}>{d.extraHours}h</td>
                        <td
                          style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}
                        >
                          {calcAmount(d).toLocaleString()}원
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 20,
                  fontSize: 13,
                  borderTop: '1px solid #eee',
                  paddingTop: 10,
                }}
              >
                <span>
                  총 건수: <b>{completed.length}건</b>
                </span>
                <span>
                  총 금액:{' '}
                  <b style={{ color: '#1a3a5c' }}>
                    {completed
                      .reduce((s, d) => s + calcAmount(d), 0)
                      .toLocaleString()}
                    원
                  </b>
                </span>
              </div>
            </div>
          </>
        )}

        {isAdmin && activeTab === '입항계획' && (
          <>
            <div style={s.row}>
              <div style={s.sec}>입항 예정 선박</div>
              <button
                style={{ ...s.btn, ...s.btnP }}
                onClick={() => setShowAddShip(!showAddShip)}
              >
                + 선박 추가
              </button>
            </div>
            {showAddShip && (
              <div style={s.infoCard}>
                <div style={s.fgrid}>
                  <div>
                    <label style={s.label}>선박명</label>
                    <input
                      style={s.input}
                      value={newShip.name}
                      onChange={(e) =>
                        setNewShip({ ...newShip, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label style={s.label}>접안 부두</label>
                    <input
                      style={s.input}
                      value={newShip.berth}
                      onChange={(e) =>
                        setNewShip({ ...newShip, berth: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label style={s.label}>입항 예정일</label>
                    <input
                      style={s.input}
                      type="date"
                      value={newShip.eta}
                      onChange={(e) =>
                        setNewShip({ ...newShip, eta: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label style={s.label}>화물 정보</label>
                    <input
                      style={s.input}
                      value={newShip.cargo}
                      onChange={(e) =>
                        setNewShip({ ...newShip, cargo: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button style={{ ...s.btn, ...s.btnP }} onClick={addShip}>
                  등록
                </button>
              </div>
            )}
            {ships.map((sh) => (
              <div key={sh.id} style={s.card}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: '#1a3a5c',
                      }}
                    >
                      {sh.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                      {sh.cargo}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{sh.eta}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {sh.berth}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!isAdmin &&
          activeTab === '내 업무현황' &&
          (() => {
            const approved = myDispatches.filter(
              (d) => d.status === '승인완료'
            );
            const waiting = myDispatches.filter((d) => d.status === '요청중');
            const totalAmt = approved.reduce((s, d) => s + calcAmount(d), 0);
            const totalHrs = approved.reduce(
              (s, d) => s + 9 * d.forklifts + d.extraHours * d.forklifts,
              0
            );
            return (
              <>
                <div style={s.infoCard}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#185FA5',
                      marginBottom: 6,
                    }}
                  >
                    {myCompany?.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#555' }}>
                    보유 지게차: <b>{myCompany?.forklifts}대</b> &nbsp;|&nbsp;{' '}
                    {myCompany?.contact}
                  </div>
                </div>
                <div style={s.metricGrid}>
                  <div style={s.metric}>
                    <div style={s.metricVal}>{waiting.length}</div>
                    <div style={s.metricLbl}>수락 대기 요청</div>
                  </div>
                  <div style={s.metric}>
                    <div style={s.metricVal}>{totalHrs}</div>
                    <div style={s.metricLbl}>완료 업무시간(h)</div>
                  </div>
                  <div style={s.metric}>
                    <div style={s.metricVal}>
                      {(totalAmt / 10000).toFixed(0)}만원
                    </div>
                    <div style={s.metricLbl}>완료 금액</div>
                  </div>
                </div>
                {waiting.length > 0 && (
                  <>
                    <div style={s.sec}>
                      수락 대기 중인 배차 요청 ({waiting.length}건)
                    </div>
                    {waiting.map((d) => (
                      <DispatchCard key={d.id} d={d} companyView />
                    ))}
                  </>
                )}
              </>
            );
          })()}

        {!isAdmin && activeTab === '배차 수락/거절' && (
          <>
            <div style={s.sec}>배차 요청 목록</div>
            {myDispatches.length === 0 ? (
              <div style={{ ...s.card, color: '#aaa', fontSize: 13 }}>
                배차 요청이 없습니다.
              </div>
            ) : (
              myDispatches.map((d) => (
                <DispatchCard key={d.id} d={d} companyView />
              ))
            )}
          </>
        )}

        {!isAdmin && activeTab === '업무기록' && (
          <>
            <div style={s.sec}>{myCompany?.name} 업무 기록</div>
            {myDispatches.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: 14 }}>
                업무 기록이 없습니다.
              </div>
            ) : (
              <div style={s.card}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>날짜</th>
                      <th style={s.th}>선박</th>
                      <th style={s.th}>부두</th>
                      <th style={s.th}>지게차</th>
                      <th style={s.th}>업무시간</th>
                      <th style={s.th}>추가</th>
                      <th style={s.th}>금액</th>
                      <th style={s.th}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myDispatches.map((d) => {
                      const ship = ships.find((sh) => sh.id === d.shipId);
                      return (
                        <tr key={d.id}>
                          <td style={s.td}>{d.date}</td>
                          <td style={s.td}>{ship?.name}</td>
                          <td style={s.td}>{ship?.berth}</td>
                          <td style={s.td}>{d.forklifts}대</td>
                          <td style={s.td}>
                            {d.startTime}~{d.endTime}
                          </td>
                          <td style={s.td}>{d.extraHours}h</td>
                          <td
                            style={{
                              ...s.td,
                              fontWeight: 600,
                              color: '#1a3a5c',
                            }}
                          >
                            {calcAmount(d).toLocaleString()}원
                          </td>
                          <td style={s.td}>
                            <span style={s.badge(d.status)}>{d.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 20,
                    fontSize: 13,
                    borderTop: '1px solid #eee',
                    paddingTop: 10,
                  }}
                >
                  <span>
                    총 건수: <b>{myDispatches.length}건</b>
                  </span>
                  <span>
                    총 금액:{' '}
                    <b style={{ color: '#1a3a5c' }}>
                      {myDispatches
                        .reduce((s, d) => s + calcAmount(d), 0)
                        .toLocaleString()}
                      원
                    </b>
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === '월별정산' && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div style={s.sec}>월별 정산</div>
              <input
                type="month"
                style={{ ...s.input, width: 'auto' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            {monthlyData.map((c) => (
              <div key={c.id} style={s.card}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: c.total > 0 ? '#3B6D11' : '#999',
                    }}
                  >
                    {c.total > 0 ? c.total.toLocaleString() + '원' : '—'}
                  </div>
                </div>
                {c.items.length === 0 ? (
                  <div style={{ color: '#aaa', fontSize: 13 }}>
                    해당 월 배차 내역 없음
                  </div>
                ) : (
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>날짜</th>
                        <th style={s.th}>선박</th>
                        <th style={s.th}>지게차</th>
                        <th style={s.th}>총 시간(h)</th>
                        <th style={s.th}>금액</th>
                        <th style={s.th}>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.items.map((d) => {
                        const ship = ships.find((sh) => sh.id === d.shipId);
                        return (
                          <tr key={d.id}>
                            <td style={s.td}>{d.date}</td>
                            <td style={s.td}>{ship?.name}</td>
                            <td style={s.td}>{d.forklifts}대</td>
                            <td style={s.td}>
                              {9 * d.forklifts + d.extraHours * d.forklifts}h
                            </td>
                            <td style={{ ...s.td, fontWeight: 600 }}>
                              {calcAmount(d).toLocaleString()}원
                            </td>
                            <td style={s.td}>
                              <span style={s.badge(d.status)}>{d.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                  총 업무시간: <b>{c.hrs}h</b>
                </div>
              </div>
            ))}
            <div
              style={{ ...s.card, background: '#f0f4fa', textAlign: 'center' }}
            >
              <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                {selectedMonth} {isAdmin ? '전체' : '내'} 합계
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1a3a5c' }}>
                {monthlyData.reduce((s, c) => s + c.total, 0).toLocaleString()}
                원
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
