import { jsPDF } from "jspdf";

export type ReceiptTxn = {
  id: string;
  type: string;
  status: string;
  amount: number | string;
  fee_amount: number | string;
  net_amount: number | string;
  currency: string;
  description: string | null;
  reference: string;
  created_at: string;
  completed_at: string | null;
  metadata?: unknown;
};

function naira(v: number | string) {
  return `NGN ${Number(v).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TITLES: Record<string, string> = {
  deposit: "Deposit receipt",
  withdrawal: "Withdrawal receipt",
  goal_contribution: "Pot top-up receipt",
  goal_withdrawal: "Pot withdrawal receipt",
  interest: "Interest receipt",
  refund: "Refund receipt",
  fee: "Fee receipt",
};

export function downloadReceipt(txn: ReceiptTxn, accountName?: string | null) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const left = 56;

  // Header band
  doc.setFillColor(18, 18, 18);
  doc.rect(0, 0, w, 110, "F");
  doc.setFillColor(255, 252, 0);
  doc.circle(left + 12, 55, 12, "F");
  doc.setTextColor(255, 252, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("SnapPots", left + 34, 62);
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Savings receipt", w - left, 62, { align: "right" });

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(TITLES[txn.type] ?? "Transaction receipt", left, 160);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text(naira(txn.amount), left, 200);

  const meta = (txn.metadata ?? {}) as Record<string, string>;
  const rows: [string, string][] = [
    ["Reference", txn.reference],
    ["Status", txn.status.charAt(0).toUpperCase() + txn.status.slice(1)],
    ["Date", new Date(txn.completed_at ?? txn.created_at).toLocaleString()],
    ["Account", accountName ?? "—"],
    ["Description", txn.description ?? "—"],
    ["Amount", naira(txn.amount)],
    ["Fee", naira(txn.fee_amount)],
    ["Net", naira(txn.net_amount)],
  ];
  if (meta.bank_name) rows.splice(4, 0, ["Destination", `${meta.bank_name} ••••${meta.account_number ?? ""}`]);

  let y = 240;
  doc.setFontSize(11);
  for (const [label, value] of rows) {
    doc.setDrawColor(230, 230, 230);
    doc.line(left, y + 8, w - left, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(label, left, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(String(value), w - left, y, { align: "right" });
    y += 34;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "This receipt was generated automatically by SnapPots and is valid without a signature.",
    left,
    y + 24,
  );
  doc.text("SnapPots is operated by SaveSphere Ltd. Questions? support@snappots.ng", left, y + 40);

  doc.save(`SnapPots-${txn.reference}.pdf`);
}
