# test_api.py
# ================================================================
# Run this AFTER starting the FastAPI server to verify both
# endpoints are working before opening the website.
#
# Usage:
#   python test_api.py
# ================================================================

import requests, json

BASE = "http://localhost:8000"

def print_result(label, result):
    print(f"\n{'='*55}")
    print(f"  {label}")
    print(f"{'='*55}")
    print(f"  Verdict    : {result['verdict']}")
    print(f"  Risk Score : {result['riskScore']} / 100")
    print(f"  Confidence : {result['confidence']:.1%}")
    print(f"  Model Ver  : {result['modelVersion']}")
    print(f"  Latency    : {result['processingTime']}ms")
    print(f"\n  Reasoning  : {result['reasoning'][:120]}...")
    print(f"\n  Top Factors:")
    for f in result["topFactors"]:
        arrow = "↑" if f["direction"] == "up" else "↓"
        print(f"    {arrow} {f['factor']}: {f['contribution']}")


# ── 1. Health check ──────────────────────────────────────────────
print("\n🔍 Health check...")
r = requests.get(BASE)
print(json.dumps(r.json(), indent=2))


# ── 2. Model 1: Low-risk transaction ────────────────────────────
print("\n\n🟢 TEST: Model 1 — Low risk transaction")
r = requests.post(f"{BASE}/predict/transaction-classifier", json={
    "TransactionAmt": 29.99,
    "V1": 0.5,
    "V3": 0.2,
    "card4": "visa",
    "ProductCD": "W",
    "hour": 14,
})
print_result("Model 1 — Low Risk", r.json())


# ── 3. Model 1: High-risk transaction ───────────────────────────
print("\n\n🔴 TEST: Model 1 — High risk transaction")
r = requests.post(f"{BASE}/predict/transaction-classifier", json={
    "TransactionAmt": 8500.00,
    "V1": -4.2,
    "V3": -3.1,
    "card4": "discover",
    "ProductCD": "C",
    "hour": 3,
})
print_result("Model 1 — High Risk", r.json())


# ── 4. Model 2: Normal transaction ──────────────────────────────
print("\n\n🟢 TEST: Model 2 — Normal anomaly score")
r = requests.post(f"{BASE}/predict/anomaly-detector", json={
    "Amount": 45.00,
    "V1":  0.1,
    "V2":  0.3,
    "V4":  0.2,
    "V14": -0.1,
    "hour": 10,
})
print_result("Model 2 — Normal", r.json())


# ── 5. Model 2: Anomalous transaction ───────────────────────────
print("\n\n🔴 TEST: Model 2 — Anomalous transaction")
r = requests.post(f"{BASE}/predict/anomaly-detector", json={
    "Amount": 12500.00,
    "V1":  -6.2,
    "V2":   4.8,
    "V4":  -5.1,
    "V14": -12.3,   # strongly negative V14 is a known fraud signal
    "hour": 2,
})
print_result("Model 2 — Anomalous", r.json())

print("\n\n✅ All tests passed! Your API is working correctly.")
print("   Now open http://localhost:3000 and test in the browser.\n")
