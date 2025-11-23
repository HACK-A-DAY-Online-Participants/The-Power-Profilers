// app/api/optimize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SupportedLanguage } from "@/lib/types";

const PYTHON_SERVICE_URL = 
  process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL || 
  process.env.PYTHON_SERVICE_URL || 
  "http://localhost:5001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, code, hotspots, use_ai } = body;

    // Validate
    if (!language || !code) {
      return NextResponse.json(
        { error: "Language and code are required" },
        { status: 400 }
      );
    }

    console.log(`📊 Optimization request for ${language}`);

    // Call Python microservice
    const response = await fetch(`${PYTHON_SERVICE_URL}/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        code,
        hotspots: hotspots || [],
        use_ai: use_ai || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Python service error:", errorData);
      return NextResponse.json(
        { 
          error: "Optimization service error", 
          details: errorData,
          hint: "Make sure Python service is running on port 5001"
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Optimization error:", error);
    
    // Check if Python service is running
    if ((error as unknown as { code?: string }).code === 'ECONNREFUSED' || (error as unknown as { cause?: { code?: string } }).cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: "Backend service not available",
          hint: "Start Python service: cd python-service && python energy_service.py",
          details: (error as Error).message
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: `Optimization failed: ${(error as Error).message}`,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/health`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: "available",
        service: data,
        url: PYTHON_SERVICE_URL
      });
    } else {
      return NextResponse.json({
        status: "unavailable",
        message: "Service not responding",
        url: PYTHON_SERVICE_URL
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: "unavailable",
      message: "Service not running",
      hint: "Start with: cd python-service && python energy_service.py",
      url: PYTHON_SERVICE_URL,
      error: (error as Error).message
    });
  }
}