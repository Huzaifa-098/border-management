import React, { useState } from 'react';
import {
  QrCode, Search, ShieldAlert, CheckCircle2, XCircle, ScanLine,
  FileText, Truck, BadgeCheck, Clock, AlertTriangle, Copy, History,
} from 'lucide-react';
import { api } from '../services/api';
import { pushToast } from '../services/feedbackStore';
import {
  PageShell, SectionCard, BtnPrimary, StatusBadge, VividStat, EmptyState,
} from './ui';

type VerifyResult = {
  valid?: boolean;
  type?: string;
  permit?: {
    permitCode: string;
    passengerName: string;
    destination: string;
    purpose: string;
    issueDate?: string;
    expiryDate: string;
    expired?: boolean;
    status?: string;
  };
  driver?: {
    fullName: string;
    contactNumber?: string;
    driverLicenseNumber?: string;
    status?: string;
  };
  vehicle?: { type?: string; registrationNumber?: string };
  official?: {
    fullName: string;
    officialRole?: string;
    department?: string;
    badgeNumber?: string;
    securityClearance?: string;
  };
  entry?: { id: string; status: string; originCity?: string; destinationCity?: string };
  originCity?: string;
  destinationCity?: string;
  tripStatus?: string;
  entryType?: string;
  trips?: unknown[];
  securityAlert?: { type: string; reason: string; name: string };
  verifiedAt?: string;
  verifiedBy?: string;
  error?: string;
};

type HistoryItem = { code: string; result: VerifyResult; at: string };

const DEMO_CODES = [
  { label: 'Truck — Khalid Abdi', code: 'demo_e3', hint: 'Approved logistics' },
  { label: 'Passenger — Amina Yusuf', code: 'demo_e4', hint: 'Approved travel' },
  { label: 'Officer-registered', code: 'demo_e7', hint: 'Passenger permit' },
];

export const QrVerify: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const verify = async (inputCode?: string) => {
    const raw = (inputCode ?? code).trim();
    setError('');
    setResult(null);
    if (!raw) {
      pushToast('warning', 'Enter a permit code, entry ID, or QR payload.');
      return;
    }

    try {
      let data: VerifyResult;
      if (raw.startsWith('{')) {
        data = (await api.verifyQr(raw)) as VerifyResult;
        data.type = 'QR_PAYLOAD';
      } else if (raw.startsWith('demo_') || raw.startsWith('e_')) {
        data = (await api.verifyDriver(raw)) as VerifyResult;
        data.type = 'DRIVER';
      } else if (raw.startsWith('BMS-')) {
        data = (await api.verifyPermit(raw)) as VerifyResult;
        data.type = 'PERMIT';
      } else {
        data = (await api.verifyPermit(raw)) as VerifyResult;
        data.type = 'PERMIT';
      }

      setResult(data);
      setHistory((prev) => [{ code: raw, result: data, at: new Date().toISOString() }, ...prev].slice(0, 8));
      if (data.securityAlert) {
        pushToast('error', `Security alert: ${data.securityAlert.name} is on the blacklist.`);
      } else if (data.valid) {
        pushToast('success', 'Document verified successfully.');
      } else {
        pushToast('warning', 'Document found but not valid for travel.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Verification failed';
      setError(msg);
    }
  };

  const isValid = result?.valid === true && !result?.securityAlert;
  const isInvalid = result && (!result.valid || result.securityAlert);

  return (
    <PageShell
      title="QR Verification"
      subtitle="Checkpoint scan — validate travel permits, driver cards & official IDs"
      onBack={onBack}
      actions={
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/20 border border-white/30 text-sm font-extrabold">
          <ScanLine size={16} /> Border Checkpoint Tool
        </span>
      }
    >
      {/* What is this for */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900">Travel Permit</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Scan <strong>BMS-XXXX</strong> code on approved passenger permits. Confirms identity, destination & expiry before border crossing.
              </p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900">Driver / Vehicle</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Enter <strong>entry ID</strong> (e.g. demo_e3) from driver QR. Shows vehicle reg, route & trip status at checkpoints.
              </p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shrink-0">
              <BadgeCheck size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900">Official ID</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Verify government badge & department for officers. JSON QR payload from printed ID cards also supported.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Scanner input */}
      <SectionCard>
        <h3 className="font-extrabold text-violet-900 text-lg mb-1 flex items-center gap-2">
          <QrCode size={22} className="text-violet-600" />
          Scan or Enter Code
        </h3>
        <p className="text-sm text-slate-500 font-medium mb-4">
          Paste QR JSON payload, permit code <span className="font-mono text-violet-600">BMS-…</span>, or entry ID <span className="font-mono text-violet-600">demo_e3</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && verify()}
            placeholder="BMS-XXXX · demo_e3 · {&quot;type&quot;:&quot;TRAVEL_PERMIT&quot;,...}"
            className="vivid-input flex-1 font-mono text-sm"
          />
          <BtnPrimary onClick={() => verify()} className="shrink-0">
            <Search size={18} /> Verify Now
          </BtnPrimary>
        </div>

        <div className="mt-4 pt-4 border-t border-violet-100">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Quick demo (approved entries)</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_CODES.map((d) => (
              <button
                key={d.code}
                type="button"
                onClick={() => { setCode(d.code); verify(d.code); }}
                className="text-left px-3 py-2 rounded-xl border-2 border-violet-100 bg-violet-50/50 hover:border-violet-300 hover:bg-violet-50 transition-all"
              >
                <span className="text-xs font-extrabold text-violet-800 block">{d.label}</span>
                <span className="text-[10px] font-mono text-violet-600">{d.code}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-center gap-3">
            <XCircle className="text-rose-600 shrink-0" size={22} />
            <p className="text-sm font-semibold text-rose-800">{error}</p>
          </div>
        )}
      </SectionCard>

      {/* Result banner */}
      {result && (
        <div
          className={`rounded-2xl p-5 flex items-center gap-4 border-2 vivid-animate-in ${
            result.securityAlert
              ? 'bg-gradient-to-r from-rose-50 to-red-50 border-rose-400'
              : isValid
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
                : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
          }`}
        >
          {result.securityAlert ? (
            <ShieldAlert size={36} className="text-rose-600 shrink-0" />
          ) : isValid ? (
            <CheckCircle2 size={36} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={36} className="text-amber-600 shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-extrabold text-lg text-slate-900">
              {result.securityAlert
                ? 'DENIED — Blacklist Match'
                : isValid
                  ? 'VERIFIED — Clear to Proceed'
                  : 'INVALID — Do Not Allow Passage'}
            </p>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              {result.securityAlert
                ? `${result.securityAlert.name}: ${result.securityAlert.reason}`
                : isValid
                  ? 'Document is authentic and currently valid.'
                  : result.permit?.expired
                    ? 'Permit has expired.'
                    : 'Entry not approved or permit inactive.'}
            </p>
            {result.verifiedAt && (
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Clock size={10} /> {new Date(result.verifiedAt).toLocaleString()}
                {result.verifiedBy && ` · by ${result.verifiedBy}`}
              </p>
            )}
          </div>
          <StatusBadge
            label={result.securityAlert ? 'BLOCKED' : isValid ? 'VALID' : 'INVALID'}
            variant={result.securityAlert ? 'danger' : isValid ? 'success' : 'warning'}
          />
        </div>
      )}

      {/* Detail cards */}
      {result?.permit && (
        <SectionCard>
          <h4 className="font-extrabold text-emerald-800 text-lg mb-4 flex items-center gap-2">
            <FileText size={20} /> Travel Permit Details
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Detail label="Permit ID" value={result.permit.permitCode} mono />
            <Detail label="Passenger" value={result.permit.passengerName} />
            <Detail label="Destination" value={result.permit.destination} />
            <Detail label="Purpose" value={result.permit.purpose} />
            <Detail label="Issued" value={result.permit.issueDate || '—'} />
            <Detail label="Expires" value={result.permit.expiryDate} highlight={result.permit.expired} />
            {result.entry && (
              <>
                <Detail label="Entry ID" value={result.entry.id} mono />
                <Detail label="Origin" value={result.entry.originCity || '—'} />
                <Detail label="Entry Status" value={result.entry.status} />
              </>
            )}
          </div>
        </SectionCard>
      )}

      {result?.driver && (
        <SectionCard>
          <h4 className="font-extrabold text-amber-800 text-lg mb-4 flex items-center gap-2">
            <Truck size={20} /> Driver &amp; Vehicle
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-2xl font-extrabold text-slate-900">{result.driver.fullName}</p>
              <p className="text-sm text-slate-600 font-medium">{result.driver.contactNumber}</p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge label={result.driver.status || 'UNKNOWN'} variant={result.valid ? 'success' : 'warning'} />
                {result.tripStatus && <StatusBadge label={result.tripStatus.replace(/_/g, ' ')} variant="info" />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Registration" value={result.vehicle?.registrationNumber || '—'} mono />
              <Detail label="Vehicle" value={result.vehicle?.type || '—'} />
              <Detail label="Route" value={`${result.originCity || '—'} → ${result.destinationCity || '—'}`} />
              <Detail label="License" value={result.driver.driverLicenseNumber || 'N/A'} mono />
              {result.trips && result.trips.length > 0 && (
                <div className="col-span-2">
                  <Detail label="Recent Trips" value={`${result.trips.length} on record`} />
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      {result?.official && (
        <SectionCard>
          <h4 className="font-extrabold text-indigo-800 text-lg mb-4 flex items-center gap-2">
            <BadgeCheck size={20} /> Official ID
          </h4>
          <p className="text-2xl font-extrabold text-slate-900">{result.official.fullName}</p>
          <p className="text-sm text-slate-600 mt-1">{result.official.officialRole} — {result.official.department}</p>
          <p className="text-xs font-mono text-indigo-700 mt-2">Badge {result.official.badgeNumber}</p>
        </SectionCard>
      )}

      {/* Stats + history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VividStat title="Checks This Session" value={history.length} icon={ScanLine} gradIndex={1} />
        <VividStat
          title="Last Result"
          value={history[0] ? (history[0].result.valid ? 'VALID' : 'FAIL') : '—'}
          icon={history[0]?.result.valid ? CheckCircle2 : XCircle}
          gradIndex={history[0]?.result.valid ? 4 : 3}
        />
        <VividStat title="Blacklist Blocks" value={history.filter((h) => h.result.securityAlert).length} icon={ShieldAlert} gradIndex={3} />
      </div>

      {history.length > 0 && (
        <SectionCard noPadding>
          <div className="px-5 py-4 border-b-2 border-violet-100 bg-gradient-to-r from-violet-50/50 to-white">
            <h4 className="font-extrabold text-violet-900 flex items-center gap-2">
              <History size={18} /> Recent Verifications
            </h4>
          </div>
          <div className="divide-y divide-slate-100">
            {history.map((h, i) => (
              <div key={`${h.code}-${i}`} className="px-5 py-3 flex items-center gap-4 hover:bg-violet-50/30 transition-colors">
                <div className={`p-2 rounded-xl ${h.result.valid && !h.result.securityAlert ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {h.result.valid && !h.result.securityAlert ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold text-slate-800 truncate">{h.code}</p>
                  <p className="text-xs text-slate-500">
                    {h.result.permit?.passengerName || h.result.driver?.fullName || '—'} · {new Date(h.at).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setCode(h.code); setResult(h.result); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                  title="Re-view"
                >
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {!result && history.length === 0 && !error && (
        <EmptyState
          icon={QrCode}
          title="Ready to scan"
          description="Enter a code above or tap a demo quick-fill button. Results appear here with full permit/driver details."
        />
      )}
    </PageShell>
  );
};

const Detail: React.FC<{ label: string; value: string; mono?: boolean; highlight?: boolean }> = ({
  label, value, mono, highlight,
}) => (
  <div>
    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
    <p className={`font-semibold ${mono ? 'font-mono text-sm' : ''} ${highlight ? 'text-rose-600' : 'text-slate-800'}`}>
      {value}
    </p>
  </div>
);
