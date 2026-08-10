"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const POLL_INTERVAL_MS = 3000;

// No real payment gateway is wired up (PayMongo/Xendit/Maya all need a
// merchant account + API keys this project doesn't have). This modal is a
// deliberately honest simulation: the QR code is real (generated
// client-side, actually scannable), but it encodes a demo payload, not a
// real GCash/QR Ph charge. "Simulate Payment Received" stands in for the
// webhook a real gateway would fire; polling GET /reference/:ref is the
// same shape a real integration would use to confirm payment server-side.
export default function PaymentModal({
  bookingReference,
  totalAmount,
  currency,
  formatPrice,
  roomType,
  quantity,
  checkIn,
  checkOut,
  onConfirmed,
  onCancelled,
}) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    const payload = `matrixhotel-demo-pay://${bookingReference}?amount=${totalAmount}`;
    QRCode.toDataURL(payload, { width: 240, margin: 1 }).then(setQrDataUrl);
  }, [bookingReference, totalAmount]);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`${API_URL}/api/bookings/reference/${bookingReference}`);
        const data = await res.json();
        if (data.success && data.data.payment_status === "paid") {
          onConfirmed(data.data);
        }
      } catch {
        // Network hiccup during polling isn't fatal - just try again next tick.
      }
    }

    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingReference]);

  async function handleSimulatePayment() {
    setSimulating(true);
    try {
      const res = await fetch(
        `${API_URL}/api/bookings/reference/${bookingReference}/simulate-payment`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.success) {
        clearInterval(pollRef.current);
        const statusRes = await fetch(`${API_URL}/api/bookings/reference/${bookingReference}`);
        const statusData = await statusRes.json();
        if (statusData.success) onConfirmed(statusData.data);
      }
    } finally {
      setSimulating(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      clearInterval(pollRef.current);
      await fetch(`${API_URL}/api/bookings/reference/${bookingReference}/cancel`, {
        method: "POST",
      });
      onCancelled();
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 text-center">
        <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--accent-color)] uppercase">
          Demo Mode - No Real Charge
        </span>

        <h2 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
          Scan to Pay
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Booking Ref: <span className="font-mono font-semibold">{bookingReference}</span>
        </p>

        <div className="mt-5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] p-4 text-left text-sm text-[var(--text-secondary)]">
          <div className="flex justify-between">
            <span>{quantity}x {roomType} Room</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>{checkIn} → {checkOut}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-[var(--border-color)] pt-3 text-base font-bold text-[var(--text-primary)]">
            <span>Total</span>
            <span>{formatPrice(totalAmount, currency)}</span>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Ph / GCash payment QR code"
              className="h-56 w-56 rounded-xl border border-[var(--border-color)] bg-white p-2"
            />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-secondary)]">
              Generating QR...
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Scan using GCash or any QR Ph app to pay. Once payment is
          detected, your room will be officially booked.
        </p>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Checking payment status automatically…
        </p>

        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={simulating}
          className="mt-6 w-full rounded-full bg-[var(--accent-color)] px-6 py-3 font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {simulating ? "Confirming…" : "Simulate Payment Received"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-3 w-full rounded-full border border-[var(--border-color)] px-6 py-3 font-medium text-[var(--text-secondary)] transition-colors hover:border-red-400 hover:text-red-400 disabled:opacity-50"
        >
          {cancelling ? "Cancelling…" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
