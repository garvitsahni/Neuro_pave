import { generateMockSensors } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sensors = generateMockSensors();

    return Response.json({
      success: true,
      data: sensors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch sensors',
      },
      { status: 500 }
    );
  }
}
