"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function DownloadPDFButton({ data, ticketType, event, formatDate, disabled }) {

  const handleDownloadPDF = async () => {
    if (!data || data.records.length === 0) return;

    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date();
    const reportDate = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const reportTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    // Header background
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, pageW, 38, "F");

    // Abhivriddhi title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(232, 228, 220);
    doc.text("Abhivriddhi", pageW / 2, 16, { align: "center" });

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 175, 165);
    doc.text("Event Attendance System  ·  Student Training and Development Committee, VIT Pune", pageW / 2, 23, { align: "center" });

    // Report title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(232, 228, 220);
    doc.text("ATTENDANCE SUMMARY REPORT", pageW / 2, 32, { align: "center" });

    // Meta info box
    let y = 46;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, y, pageW - 28, 28, 2, 2, "F");

    const eventLabel = event === "ALL" ? "All Events" : event;
    const ticketLabel = ticketType === "ALL" ? "All Ticket Types" : ticketType;

    // Left column labels
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Event:", 18, y + 8);
    doc.text("Ticket Type:", 18, y + 15);
    doc.text("Generated On:", 18, y + 22);

    // Left column values
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(eventLabel, 48, y + 8);
    doc.text(ticketLabel, 48, y + 15);
    doc.text(`${reportDate}  ${reportTime}`, 48, y + 22);

    // Right column labels
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("Total Attended:", pageW / 2 + 4, y + 8);
    doc.text("DAY1:", pageW / 2 + 4, y + 15);
    doc.text("DAY2 / COMBO:", pageW / 2 + 4, y + 22);

    // Right column values
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(String(data.total), pageW - 18, y + 8, { align: "right" });
    doc.text(String(data.counts.DAY1), pageW - 18, y + 15, { align: "right" });
    doc.text(`${data.counts.DAY2} / ${data.counts.COMBO}`, pageW - 18, y + 22, { align: "right" });

    // Attendee list heading
    y += 34;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`Attendee List  (${data.total} ${data.total === 1 ? "record" : "records"})`, 14, y);
    y += 4;

    // Table
    autoTable(doc, {
      startY: y,
      head: [["#", "Name", "Email", "PRN", "Ticket", "Event", "Time"]],
      body: data.records.map((r, i) => [
        i + 1,
        r.name.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        r.email,
        r.prn || "-",
        r.ticketType,
        r.registeredEvent,
        formatDate(r.timestamp),
      ]),
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [15, 15, 15], textColor: [232, 228, 220], fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 38 },
        2: { cellWidth: 48 },
        3: { cellWidth: 20 },
        4: { cellWidth: 16, halign: "center" },
        5: { cellWidth: 18 },
        6: { cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (hookData) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Abhivriddhi  ·  Page ${hookData.pageNumber} of ${pageCount}  ·  Generated ${reportDate}`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 6,
          { align: "center" }
        );
      },
    });

    const fileName = `attendance_${ticketType}_${event.replace(" ", "_")}_${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={disabled}>
      <FileText className="h-4 w-4 mr-2" />
      Download PDF
    </Button>
  );
}
