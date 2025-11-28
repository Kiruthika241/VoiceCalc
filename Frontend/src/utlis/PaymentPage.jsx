import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Smartphone,
  Building2,
  CreditCard,
  Banknote,
  ArrowLeft,
} from "lucide-react";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState("upi");

  // Netbanking
  const [bankOpen, setBankOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [bankFilter, setBankFilter] = useState("");

  // Offer
  const [offerCode, setOfferCode] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerApplied, setOfferApplied] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();

  const plan = state?.plan || "No Plan Selected";
  const priceLabel = state?.priceLabel || state?.price || "₹0";
  const baseAmountFromState = state?.amount;

  const baseAmount = useMemo(() => {
    if (typeof baseAmountFromState === "number") return baseAmountFromState;
    const num = parseInt(String(priceLabel).replace(/[^\d]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }, [baseAmountFromState, priceLabel]);

  const [payableAmount, setPayableAmount] = useState(baseAmount);

  const banks = [
    {
      name: "State Bank of India",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/SBI-logo.svg",
    },
    {
      name: "HDFC Bank",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5b/HDFC_Bank_Logo.svg",
    },
    {
      name: "ICICI Bank",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/16/ICICI_Bank_Logo.svg",
    },
    {
      name: "Axis Bank",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/AXISBankLogo.svg",
    },
    {
      name: "Punjab National Bank",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/0b/PNB_Logo.png",
    },
  ];

  const handleApplyOffer = async () => {
    const trimmed = offerCode.trim();

    if (!trimmed) {
      setOfferApplied(false);
      setOfferMessage("Please enter an offer code.");
      setPayableAmount(baseAmount);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/offers/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmed,
          amount: baseAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setOfferApplied(false);
        setOfferMessage(data.message || "Invalid or expired code.");
        setPayableAmount(baseAmount);
        return;
      }

      setOfferApplied(true);
      setPayableAmount(data.newAmount);
      setOfferMessage(
        data.message ||
          `Offer applied! You save ₹${baseAmount - data.newAmount}.`
      );
    } catch (err) {
      console.error("Error applying offer:", err);
      setOfferApplied(false);
      setOfferMessage("Something went wrong. Try again.");
      setPayableAmount(baseAmount);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-start bg-gradient-to-b from-white via-pink-50 to-purple-100 px-4 pt-28 pb-10">
      <div className="w-full max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* PAYMENT CARD */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-sm font-semibold tracking-widest text-pink-600 uppercase">
              Payment Gateway
            </h2>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Complete Your Payment
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Select a payment mode to continue
            </p>
          </div>

          {/* Plan Summary + Offer */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {/* Plan Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-gray-700 flex justify-between">
                <span>Selected Plan</span>
                <span className="text-pink-600 font-bold">{plan}</span>
              </h3>

              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Original Price</span>
                <span className="font-semibold text-gray-800">{priceLabel}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {offerApplied ? "Offer Price" : "Payable Amount"}
                </span>

                <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  ₹{payableAmount}
                </span>
              </div>
            </div>

            {/* Offer */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Have an offer code?
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value)}
                  placeholder="Enter offer code (ex: EZY149)"
                  className="flex-1 p-2.5 rounded-xl border border-gray-300 focus:border-pink-500 focus:outline-none text-sm uppercase"
                />
                <button
                  onClick={handleApplyOffer}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold shadow-md hover:opacity-95 transition-all"
                >
                  Apply
                </button>
              </div>

              {offerMessage && (
                <p
                  className={`text-xs ${
                    offerApplied ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {offerMessage}
                </p>
              )}
            </div>
          </div>

          {/* Payment Mode */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              { id: "upi", name: "UPI", icon: <Smartphone size={20} /> },
              { id: "netbanking", name: "Net Banking", icon: <Building2 size={20} /> },
              { id: "debit", name: "Debit Card", icon: <CreditCard size={20} /> },
              { id: "credit", name: "Credit Card", icon: <Banknote size={20} /> },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border text-sm font-medium transition-all shadow-sm ${
                  selectedMethod === method.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-[1.05]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-pink-400 hover:text-pink-600"
                }`}
              >
                {method.icon}
                {method.name}
              </button>
            ))}
          </div>

          {/* Payment Content */}
          <div className="bg-white/70 border border-gray-200 rounded-2xl p-8 shadow-md">
            {/* UPI */}
            {selectedMethod === "upi" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Pay via UPI</h3>

                <p className="text-sm text-gray-500">
                  Amount:{" "}
                  <span className="font-semibold text-pink-600">
                    ₹{payableAmount}
                  </span>
                </p>

                <input
                  type="text"
                  placeholder="Enter UPI ID"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-pink-500"
                />

                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-md hover:opacity-95">
                  Proceed to Pay ₹{payableAmount}
                </button>
              </div>
            )}

            {/* NET BANKING */}
            {selectedMethod === "netbanking" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Select Bank</h3>

                <p className="text-sm text-gray-500">
                  Amount:{" "}
                  <span className="font-semibold text-pink-600">
                    ₹{payableAmount}
                  </span>
                </p>

                {/* Bank Dropdown */}
                <div className="relative w-full">
                  <button
                    onClick={() => setBankOpen(!bankOpen)}
                    className="w-full p-4 bg-white rounded-xl border border-gray-300 flex justify-between items-center text-gray-700 font-medium shadow-sm hover:border-pink-500"
                  >
                    {selectedBank || "Choose Your Bank"}
                    <span>{bankOpen ? "▲" : "▼"}</span>
                  </button>

                  {bankOpen && (
                    <div
                      className="
                        w-full mt-3 p-3 rounded-2xl bg-white/90 border border-gray-200 shadow-xl
                        max-h-72 overflow-hidden relative z-30
                      "
                    >
                      <input
                        type="text"
                        placeholder="Search bank..."
                        className="w-full mb-3 p-2 rounded-lg border border-gray-300 focus:border-pink-500 text-sm"
                        onChange={(e) => setBankFilter(e.target.value.toLowerCase())}
                      />

                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {banks
                          .filter((b) => b.name.toLowerCase().includes(bankFilter))
                          .map((bank) => (
                            <div
                              key={bank.name}
                              onClick={() => {
                                setSelectedBank(bank.name);
                                setBankOpen(false);
                              }}
                              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition cursor-pointer"
                            >
                              <img src={bank.logo} className="w-6 h-6" />
                              <span className="font-medium text-gray-700">
                                {bank.name}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-md hover:opacity-95">
                  Continue to Bank (₹{payableAmount})
                </button>
              </div>
            )}

            {/* DEBIT CARD */}
            {selectedMethod === "debit" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Debit Card</h3>

                <p className="text-sm text-gray-500">
                  Amount:{" "}
                  <span className="font-semibold text-pink-600">
                    ₹{payableAmount}
                  </span>
                </p>

                <input
                  type="text"
                  maxLength={16}
                  placeholder="Card Number"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-pink-500"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="p-3 rounded-xl border border-gray-300"
                  />
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="CVV"
                    className="p-3 rounded-xl border border-gray-300"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Cardholder Name"
                  className="w-full p-3 rounded-xl border border-gray-300"
                />

                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-95">
                  Pay Securely ₹{payableAmount}
                </button>
              </div>
            )}

            {/* CREDIT CARD */}
            {selectedMethod === "credit" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Credit Card</h3>

                <p className="text-sm text-gray-500">
                  Amount:{" "}
                  <span className="font-semibold text-pink-600">
                    ₹{payableAmount}
                  </span>
                </p>

                <input
                  type="text"
                  maxLength={16}
                  placeholder="Card Number"
                  className="w-full p-3 rounded-xl border border-gray-300"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="p-3 rounded-xl border border-gray-300"
                  />
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="CVV"
                    className="p-3 rounded-xl border border-gray-300"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Cardholder Name"
                  className="w-full p-3 rounded-xl border border-gray-300"
                />

                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-95">
                  Pay Now ₹{payableAmount}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
