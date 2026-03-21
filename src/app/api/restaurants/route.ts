import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([{
    _id: "demo12345678901234567890",
    name: "Scan4Serve Demo",
    location: "SNMIMT",
    managerName: "Demo User",
    managerEmail: "demo@scan4serve.com",
    mobile: "+91 0000000000",
    status: "active",
    managerPhoto: "https://via.placeholder.com/150",
    valuation: "₹1,000,000",
    staffCount: 5,
    createdAt: new Date().toISOString()
  }]);
}
