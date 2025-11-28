// src/pages/Plan.jsx
import { useEffect, useState } from "react";
import { CheckCircle2, Rocket, Star, Crown, Infinity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api"; // same as admin

export default function Plan() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plansFromDb, setPlansFromDb] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_BASE}/plans`);
        const data = await res.json();
        // only show active plans to users
        setPlansFromDb(data.filter((p) => p.status === "Active"));
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // map DB plan -> UI props (icon, gradient, button color)
  const decoratePlan = (plan) => {
    switch (plan.name) {
      case "Go":
        return {
          title: plan.name,
          price: plan.price || "₹149 - month",
          icon: <Star className="text-pink-500 w-9 h-9" />,
          gradient: "from-gray-100 to-gray-200",
          buttonColor: "from-gray-700 to-gray-800",
        };
      case "Pro":
        return {
          title: plan.name,
          price: plan.price || "₹499 - 6 months",
          icon: <Rocket className="text-purple-500 w-9 h-9" />,
          gradient: "from-pink-100 via-purple-100 to-indigo-100",
          buttonColor: "from-pink-500 to-purple-600",
        };
      case "Plus":
        return {
          title: plan.name,
          price: plan.price || "₹899 - year",
          icon: <Crown className="text-indigo-500 w-9 h-9" />,
          gradient: "from-indigo-100 to-purple-200",
          buttonColor: "from-indigo-500 to-purple-600",
        };
      case "Elite":
        return {
          title: plan.name,
          price: plan.price || "₹1999 - lifetime",
          icon: <Infinity className="text-pink-600 w-9 h-9" />,
          gradient: "from-pink-50 via-white to-purple-50",
          buttonColor: "from-pink-500 to-indigo-600",
        };
      default:
        // default styling for any new plan added from admin
        return {
          title: plan.name,
          price: plan.price,
          icon: <Star className="text-purple-500 w-9 h-9" />,
          gradient: "from-white to-gray-100",
          buttonColor: "from-purple-500 to-indigo-600",
        };
    }
  };

  return (
    <main className="relative w-full bg-gradient-to-b from-white via-pink-50 to-purple-50 text-gray-900 overflow-x-hidden">
      <section className="w-full text-center pt-24 pb-12 px-4 sm:px-10">
        <p className="uppercase tracking-[0.25em] text-sm text-pink-600 font-semibold mb-2">
          PLAN IT. PICK IT. POWER UP.
        </p>
        <span className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto block mb-4"></span>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600">
            EzyVoice Plans
          </span>{" "}
          that fit the way you create.
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto text-lg">
          Unlock smarter features, faster performance, and unlimited creativity.
        </p>
      </section>

      {loading ? (
        <p className="text-center text-gray-600 pb-10">Loading plans...</p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-6 sm:px-10 md:px-24 pb-20 max-w-[1600px] mx-auto">
          {plansFromDb.map((plan) => {
            const decorated = decoratePlan(plan);
            return (
              <PlanCard
                key={plan._id}
                title={decorated.title}
                price={decorated.price}
                icon={decorated.icon}
                gradient={decorated.gradient}
                buttonColor={decorated.buttonColor}
                features={plan.features || []}
                selected={selectedPlan === plan.name}
                onSelect={() =>
                  setSelectedPlan(
                    selectedPlan === plan.name ? null : plan.name
                  )
                }
              />
            );
          })}
        </section>
      )}
    </main>
  );
}

/* --- PLAN CARD COMPONENT --- */
function PlanCard({
  title,
  price,
  features,
  gradient,
  buttonColor,
  icon,
  selected,
  onSelect,
}) {
  const navigate = useNavigate();

  const handleCheckout = (e) => {
    e.stopPropagation();

    // extract numeric amount from price string like "₹149 - month"
    const numericAmount =
      parseInt(String(price).replace(/[^\d]/g, ""), 10) || 0;

    navigate("/payment", {
      state: {
        plan: title,
        priceLabel: price, // full label like "₹149 - month"
        amount: numericAmount, // e.g. 149
      },
    });
  };

  // 🔥 Make PRO button dark when selected (like Go plan)
  const isProDarkSelected = title === "Pro" && selected;

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col justify-between bg-gradient-to-br ${gradient} p-6 sm:p-8 rounded-2xl shadow-md backdrop-blur-lg border border-white/60 cursor-pointer transition-all ${
        selected ? "ring-4 ring-pink-500 shadow-xl" : ""
      }`}
      style={{
        minHeight: "340px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <div className="flex flex-col items-center text-center mb-4">
        <div className="mb-3">{icon}</div>
        <h3 className="text-lg font-bold text-[#0F172A]">{title}</h3>
        <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
          {price}
        </p>
      </div>

      <ul className="space-y-2 text-gray-700 mb-6 text-base">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle2 className="text-pink-500 w-5 h-5" /> {f}
          </li>
        ))}
      </ul>

      <button
        onClick={selected ? handleCheckout : onSelect}
        className={`w-full py-2.5 rounded-full text-white font-semibold bg-gradient-to-r ${
          isProDarkSelected ? "from-gray-700 to-gray-800" : buttonColor
        } hover:opacity-90 transition`}
      >
        {selected ? "Proceed to Checkout →" : "Choose Plan"}
      </button>
    </div>
  );
}
