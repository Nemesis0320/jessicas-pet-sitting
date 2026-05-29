// Pricing & invoicing — admin section
const { useState: iUS } = React;

function fmtMoney(n, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n || 0);
}

const INVOICE_STATUS = {
  draft:    { label: "Draft",    color: "var(--ink-3)",    bg: "var(--bg-2)" },
  sent:     { label: "Sent",     color: "var(--brown)",    bg: "#FCEFD3" },
  paid:     { label: "Paid",     color: "var(--green-deep)", bg: "#E6F0E1" },
  overdue:  { label: "Overdue",  color: "var(--heart)",    bg: "#FBE0E0" },
  void:     { label: "Void",     color: "var(--ink-3)",    bg: "var(--bg-2)" },
};

function InvoiceStatusBadge({ status }) {
  const s = INVOICE_STATUS[status] || INVOICE_STATUS.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 800,
      padding: "3px 10px",
      borderRadius: 999,
      background: s.bg, color: s.color,
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }}/>
      {s.label}
    </span>
  );
}

// Admin "Invoices" page — list, filter, status transitions
function AdminInvoices({ invoices, pricing, homes, appointments, onUpdate, onCreate, toast }) {
  const [filter, setFilter] = iUS("all");
  const [editing, setEditing] = iUS(null);
  const [showPricing, setShowPricing] = iUS(false);

  const filtered = invoices
    .filter(i => filter === "all" ? true : i.status === filter)
    .sort((a, b) => (b.number || "").localeCompare(a.number || ""));

  const totalOutstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);

  const advance = (inv) => {
    const next = { ...inv };
    if (inv.status === "draft") next.status = "sent";
    else if (inv.status === "sent") next.status = "paid";
    onUpdate(next);
    toast(`Invoice ${inv.number} marked ${next.status}`);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="hello">money matters —</div>
          <h1>Invoices</h1>
          <div className="sub">{invoices.length} invoices · {fmtMoney(totalOutstanding)} outstanding · {fmtMoney(totalPaid)} collected</div>
        </div>
        <div className="row">
          <button className="btn btn-outline" onClick={() => setShowPricing(true)}><I.cog size={14}/> Pricing</button>
          <button className="btn btn-purple" onClick={onCreate}><I.plus size={14}/> New invoice</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="icon" style={{ background: "#FCEFD3", color: "#7A5615" }}><I.calendar size={20}/></div>
          <div><div className="num">{invoices.filter(i => i.status === "draft").length}</div><div className="lbl">Drafts</div></div>
        </div>
        <div className="stat">
          <div className="icon" style={{ background: "#EDE3F7", color: "var(--purple-deep)" }}><I.bell size={20}/></div>
          <div><div className="num">{invoices.filter(i => i.status === "sent").length}</div><div className="lbl">Awaiting payment</div></div>
        </div>
        <div className="stat">
          <div className="icon" style={{ background: "#E6F0E1", color: "var(--green-deep)" }}><I.check size={20}/></div>
          <div><div className="num">{fmtMoney(totalPaid)}</div><div className="lbl">Collected</div></div>
        </div>
        <div className="stat">
          <div className="icon" style={{ background: "#FBE0E0", color: "#8B2929" }}><I.upload size={20}/></div>
          <div><div className="num">{fmtMoney(totalOutstanding)}</div><div className="lbl">Outstanding</div></div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18, padding: "14px 18px" }}>
        <div className="row" style={{ gap: 8 }}>
          {[["all","All"],["draft","Drafts"],["sent","Sent"],["paid","Paid"],["overdue","Overdue"]].map(([k,l]) => (
            <button key={k} className={"btn btn-sm " + (filter === k ? "btn-primary" : "btn-ghost")} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-3)" }}>No invoices to show.</div>
        ) : filtered.map(inv => {
          const home = homes.find(h => h.id === inv.homeId);
          return (
            <div key={inv.id} className="card card-pad" style={{ cursor: "pointer" }} onClick={() => setEditing(inv)}>
              <div className="between">
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--bg-2)", color: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontFamily: "ui-monospace, monospace", fontSize: 13, flexShrink: 0 }}>
                    #{inv.number?.split("-")[1] || "—"}
                  </div>
                  <div>
                    <div className="row" style={{ gap: 8, marginBottom: 2 }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{home?.name || "—"}</div>
                      <InvoiceStatusBadge status={inv.status}/>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                      Invoice #{inv.number} · {inv.days} days · {inv.petCount} pet{inv.petCount === 1 ? "" : "s"} · Issued {inv.issued ? new Date(inv.issued).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{fmtMoney(inv.total, pricing.currency)}</div>
                  {inv.status === "draft" && (
                    <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); advance(inv); }} style={{ marginTop: 4 }}>Send →</button>
                  )}
                  {inv.status === "sent" && (
                    <button className="btn btn-green btn-sm" onClick={e => { e.stopPropagation(); advance(inv); }} style={{ marginTop: 4 }}><I.check size={13}/> Mark paid</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && <InvoiceDetailModal invoice={editing} pricing={pricing} home={homes.find(h => h.id === editing.homeId)} onClose={() => setEditing(null)} onSave={(updated) => { onUpdate(updated); setEditing(null); toast("Invoice updated"); }}/>}
      {showPricing && <PricingModal pricing={pricing} onClose={() => setShowPricing(false)} onSave={(p) => { setShowPricing(false); toast("Pricing saved"); window.__pricingUpdate?.(p); }}/>}
    </div>
  );
}

function InvoiceDetailModal({ invoice, pricing, home, onClose, onSave }) {
  const [form, setForm] = iUS({ ...invoice });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const r = pricing || {};
  const petDays = (form.days || 0) * Math.max(0, (form.petCount || 1) - 1);
  const baseTotal = (form.days || 0) * (form.rate || r.baseRate);
  const extrasTotal = (form.extras || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const total = baseTotal + petDays * (r.perAdditionalPet || 0) + extrasTotal;

  const addExtra = () => setForm(f => ({ ...f, extras: [...(f.extras || []), { label: "Extra service", amount: 0 }] }));
  const removeExtra = (i) => setForm(f => ({ ...f, extras: f.extras.filter((_, j) => j !== i) }));
  const updateExtra = (i, key, val) => setForm(f => ({ ...f, extras: f.extras.map((e, j) => j === i ? { ...e, [key]: key === "amount" ? Number(val) : val } : e) }));

  return (
    <Modal
      size="lg"
      title={`Invoice ${invoice.number}`}
      subtitle={`${home?.name || "—"} · ${INVOICE_STATUS[invoice.status]?.label}`}
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={() => onSave({ ...form, total })}>Save changes</button>
      </>}
    >
      <div className="form-section">Line items</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field"><label>Days</label><input className="input" type="number" min="0" value={form.days} onChange={e => set("days", Number(e.target.value))}/></div>
        <div className="field"><label>Pet count</label><input className="input" type="number" min="1" value={form.petCount} onChange={e => set("petCount", Number(e.target.value))}/></div>
        <div className="field"><label>Daily rate</label><div className="input-row"><span style={{ padding: "12px 0 0", color: "var(--ink-3)" }}>$</span><input className="input" type="number" min="0" value={form.rate || pricing.baseRate} onChange={e => set("rate", Number(e.target.value))}/></div></div>
      </div>

      <div className="form-section">Extras</div>
      {(form.extras || []).map((e, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px 36px", gap: 8 }}>
          <input className="input" value={e.label} onChange={ev => updateExtra(i, "label", ev.target.value)} placeholder="Description"/>
          <input className="input" type="number" value={e.amount} onChange={ev => updateExtra(i, "amount", ev.target.value)} placeholder="0"/>
          <button className="btn btn-ghost btn-sm" onClick={() => removeExtra(i)}><I.x size={14}/></button>
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={addExtra} style={{ alignSelf: "flex-start" }}><I.plus size={14}/> Add line</button>

      <div className="form-section">Total</div>
      <div style={{ padding: 14, background: "var(--bg-2)", borderRadius: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", fontSize: 13, padding: "2px 0" }}>
          <span>Base: {form.days} days × {fmtMoney(form.rate || pricing.baseRate)}</span>
          <span>{fmtMoney(baseTotal)}</span>
        </div>
        {petDays > 0 && (
          <div className="row" style={{ justifyContent: "space-between", fontSize: 13, padding: "2px 0" }}>
            <span>Additional pets: {petDays} pet-days × {fmtMoney(pricing.perAdditionalPet)}</span>
            <span>{fmtMoney(petDays * pricing.perAdditionalPet)}</span>
          </div>
        )}
        {extrasTotal > 0 && (
          <div className="row" style={{ justifyContent: "space-between", fontSize: 13, padding: "2px 0" }}>
            <span>Extras</span><span>{fmtMoney(extrasTotal)}</span>
          </div>
        )}
        <div className="row" style={{ justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line-2)", fontSize: 18, fontWeight: 800 }}>
          <span>Total</span><span>{fmtMoney(total)}</span>
        </div>
      </div>

      <div className="form-section">Status</div>
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        {["draft", "sent", "paid", "overdue", "void"].map(s => (
          <button key={s}
            className={"btn btn-sm " + (form.status === s ? "btn-primary" : "btn-outline")}
            onClick={() => set("status", s)}>
            {INVOICE_STATUS[s].label}
          </button>
        ))}
      </div>
    </Modal>
  );
}

function PricingModal({ pricing, onClose, onSave }) {
  const [form, setForm] = iUS({ ...pricing });
  const set = (k, v) => setForm(f => ({ ...f, [k]: Number(v) || 0 }));
  return (
    <Modal
      title="Pricing defaults"
      subtitle="Used when creating new invoices. You can override per-invoice."
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>Save pricing</button>
      </>}
    >
      <div className="field"><label>Daily base rate (first pet)</label><div className="input-row"><span style={{ padding: "12px 0 0", color: "var(--ink-3)" }}>$</span><input className="input" type="number" value={form.baseRate} onChange={e => set("baseRate", e.target.value)}/></div></div>
      <div className="field"><label>Each additional pet, per day</label><div className="input-row"><span style={{ padding: "12px 0 0", color: "var(--ink-3)" }}>$</span><input className="input" type="number" value={form.perAdditionalPet} onChange={e => set("perAdditionalPet", e.target.value)}/></div></div>
      <div className="field"><label>Medication administration (flat per sitting)</label><div className="input-row"><span style={{ padding: "12px 0 0", color: "var(--ink-3)" }}>$</span><input className="input" type="number" value={form.medAdminFlat} onChange={e => set("medAdminFlat", e.target.value)}/></div></div>
      <div className="field"><label>Weekend surcharge per day</label><div className="input-row"><span style={{ padding: "12px 0 0", color: "var(--ink-3)" }}>$</span><input className="input" type="number" value={form.weekendSurcharge} onChange={e => set("weekendSurcharge", e.target.value)}/></div></div>
    </Modal>
  );
}

// Owner-side: their own invoices (read-only with pay button)
function UserInvoicesSection({ invoices, pricing, onOpen }) {
  if (!invoices || invoices.length === 0) return null;
  return (
    <div className="section">
      <h2>Invoices <span className="count">{invoices.length}</span></h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {invoices.map(inv => (
          <div key={inv.id} className="card card-pad" style={{ cursor: "pointer", transition: "transform .12s ease" }} onClick={() => onOpen?.(inv)}>
            <div className="between">
              <div>
                <div className="row" style={{ gap: 8, marginBottom: 2 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>Invoice #{inv.number}</div>
                  <InvoiceStatusBadge status={inv.status}/>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                  {inv.days} days · {inv.petCount} pet{inv.petCount === 1 ? "" : "s"} · Issued {inv.issued ? new Date(inv.issued).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{fmtMoney(inv.total, pricing.currency)}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>Click for details</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Onboarding checklist (admin home detail)
function OnboardingChecklist({ home, allPets, allUsers, progress, onToggle, onComplete }) {
  const steps = window.ONBOARDING_STEPS;

  // Auto-detect some steps from actual data
  const primary = (home.residents || []).map(uid => allUsers[uid]).find(u => u);
  const autoStatus = {
    claimed: !!primary,
    address: !!(home.address && home.address.length > 5),
    access:  !!(home.accessDetail && home.accessDetail.length > 0),
    pets:    (home.pets || []).length > 0,
    vaccines: (home.pets || []).every(pid => (allPets[pid]?.vaccines || []).length > 0) && (home.pets || []).length > 0,
  };

  const isDone = (s) => progress[s.id] || autoStatus[s.id];
  const completedCount = steps.filter(isDone).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="card card-pad" style={{ background: "linear-gradient(180deg, #EDE3F7 0%, var(--card) 25%)", border: "1px solid #D5BFEA" }}>
      <div className="between" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--purple-deep)", fontWeight: 800, letterSpacing: "0.08em" }}>ONBOARDING CHECKLIST</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{completedCount} of {steps.length} complete</div>
        </div>
        {completedCount === steps.length && (
          <button className="btn btn-green" onClick={onComplete}><I.check size={14}/> Move to upcoming</button>
        )}
      </div>

      <div style={{ height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--purple)", borderRadius: 999, transition: "width .4s ease" }}/>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map(s => {
          const done = isDone(s);
          const auto = autoStatus[s.id] && !progress[s.id];
          return (
            <button key={s.id} onClick={() => auto ? null : onToggle(s.id)} disabled={auto} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "10px 12px",
              border: "1px solid " + (done ? "rgba(58, 107, 51, 0.3)" : "var(--line)"),
              borderRadius: 12,
              background: done ? "#E6F0E1" : "var(--card)",
              cursor: auto ? "default" : "pointer",
              textAlign: "left",
              opacity: auto ? 0.95 : 1,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                border: "2px solid " + (done ? "var(--green-deep)" : "var(--line-2)"),
                background: done ? "var(--green)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
                color: "#fff",
              }}>
                {done && <I.check size={14}/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: done ? "var(--green-deep)" : "var(--ink)" }}>
                  {s.label}
                  {auto && <span style={{ marginLeft: 8, fontSize: 10, padding: "1px 6px", borderRadius: 999, background: "rgba(58, 107, 51, 0.15)", color: "var(--green-deep)", fontWeight: 800, letterSpacing: "0.04em" }}>AUTO</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{s.hint}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { AdminInvoices, OnboardingChecklist, UserInvoicesSection, InvoiceStatusBadge, fmtMoney, UserInvoiceDetail });

// User-facing invoice detail with print
function UserInvoiceDetail({ invoice, pricing, home, sittingDates, onClose, onPay, toast }) {
  const r = pricing || {};
  const petDays = (invoice.days || 0) * Math.max(0, (invoice.petCount || 1) - 1);
  const baseTotal = (invoice.days || 0) * (invoice.rate || r.baseRate);
  const extrasTotal = (invoice.extras || []).reduce((s, e) => s + Number(e.amount || 0), 0);

  const handlePrint = () => {
    // Render the invoice content into a hidden iframe and print just that —
    // so we don't get the whole app, the top nav, or other modals on the page.
    const node = document.querySelector(".invoice-print");
    if (!node) return;

    // Collect stylesheets so the print iframe inherits the look
    const styles = [...document.styleSheets].map(ss => {
      try { return [...ss.cssRules].map(r => r.cssText).join("\n"); }
      catch (e) { return ss.href ? `@import url("${ss.href}");` : ""; }
    }).join("\n");

    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${invoice.number}</title>
      <style>${styles}
        body { background: white; padding: 32px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #111; }
        .invoice-print { max-width: 760px; margin: 0 auto; }
        .invoice-print table { width: 100%; border-collapse: collapse; }
        @page { margin: 0.5in; }
      </style></head><body>${node.outerHTML}</body></html>`);
    doc.close();

    // Give the iframe a beat to lay out, then print, then clean up
    setTimeout(() => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (e) {}
      setTimeout(() => document.body.removeChild(frame), 500);
    }, 200);
  };

  return (
    <Modal
      size="lg"
      title={`Invoice #${invoice.number}`}
      subtitle={`${home?.name || ""} · ${INVOICE_STATUS[invoice.status]?.label}`}
      onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={handlePrint}><I.upload size={14}/> Print / save PDF</button>
        {invoice.status === "sent" && <button className="btn btn-green" onClick={onPay}><I.check size={14}/> Pay now</button>}
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </>}
    >
      <div className="invoice-print">
        {/* Letterhead */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 18, borderBottom: "2px solid var(--line)", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 32, fontWeight: 700, color: "var(--brown)", lineHeight: 1 }}>Jessica's</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "var(--green)", marginTop: 4 }}>PET SITTING</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>
              Gurnee, IL · (847) 855-0100<br/>
              jessica@jessicaspetsitting.com
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.08em" }}>INVOICE</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>#{invoice.number}</div>
            <div style={{ marginTop: 6 }}><InvoiceStatusBadge status={invoice.status}/></div>
          </div>
        </div>

        {/* Bill to */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>BILL TO</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{home?.name || "—"}</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{home?.address || ""}</div>
          </div>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 14px", fontSize: 13 }}>
              <div style={{ color: "var(--ink-3)" }}>Issued</div>
              <div style={{ fontWeight: 600 }}>{invoice.issued ? new Date(invoice.issued).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" }) : "—"}</div>
              <div style={{ color: "var(--ink-3)" }}>Due in</div>
              <div style={{ fontWeight: 600 }}>{invoice.dueIn || 14} days</div>
              {sittingDates && (<>
                <div style={{ color: "var(--ink-3)" }}>Sitting</div>
                <div style={{ fontWeight: 600 }}>{sittingDates}</div>
              </>)}
            </div>
          </div>
        </div>

        {/* Line items */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
          <thead>
            <tr style={{ borderBottom: "1.5px solid var(--line)" }}>
              <th style={thStyle}>Description</th>
              <th style={{ ...thStyle, textAlign: "center", width: 80 }}>Qty</th>
              <th style={{ ...thStyle, textAlign: "right", width: 100 }}>Rate</th>
              <th style={{ ...thStyle, textAlign: "right", width: 100 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={tdStyle}>
                <div style={{ fontWeight: 600 }}>Pet sitting — base rate</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Standard daily care for first pet</div>
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{invoice.days} days</td>
              <td style={{ ...tdStyle, textAlign: "right" }}>{fmtMoney(invoice.rate || r.baseRate)}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{fmtMoney(baseTotal)}</td>
            </tr>
            {petDays > 0 && (
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>Additional pets</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{invoice.petCount - 1} extra pet × {invoice.days} days</div>
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{petDays}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>{fmtMoney(r.perAdditionalPet)}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{fmtMoney(petDays * r.perAdditionalPet)}</td>
              </tr>
            )}
            {(invoice.extras || []).map((e, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{e.label}</div>
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>—</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>—</td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{fmtMoney(e.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ ...tdStyle, textAlign: "right", fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>Subtotal</td>
              <td style={{ ...tdStyle, textAlign: "right", fontSize: 13, fontWeight: 600 }}>{fmtMoney(invoice.total)}</td>
            </tr>
            <tr>
              <td colSpan="3" style={{ padding: "10px 8px", textAlign: "right", fontSize: 16, fontWeight: 800, borderTop: "2px solid var(--ink)" }}>Total due</td>
              <td style={{ padding: "10px 8px", textAlign: "right", fontSize: 22, fontWeight: 800, borderTop: "2px solid var(--ink)" }}>{fmtMoney(invoice.total)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Payment / notes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, padding: 14, background: "var(--bg-2)", borderRadius: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>PAYMENT — ZELLE</div>
            <div style={{ fontSize: 13 }}><strong>Jessica Samp</strong></div>
            <div style={{ fontSize: 13, fontFamily: "ui-monospace, monospace" }}>GerryRose77@yahoo.com</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>Check or cash also accepted</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>QUESTIONS?</div>
            <div style={{ fontSize: 13 }}>Reach out to Jessica directly with any questions about this invoice.</div>
          </div>
        </div>

        <div style={{ marginTop: 22, fontFamily: "'Caveat', cursive", fontSize: 22, color: "var(--brown)", textAlign: "center", fontWeight: 600 }}>
          Thank you for trusting us with your pets! 🐾
        </div>
      </div>
    </Modal>
  );
}

const thStyle = { textAlign: "left", padding: "8px 8px", fontSize: 11, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.06em" };
const tdStyle = { padding: "12px 8px", fontSize: 13, verticalAlign: "top" };
