import { generateMockSensors, generateHistoricalReadings } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sensors = generateMockSensors();
    const sensor = sensors.find((s) => s.id === id);

    if (!sensor) {
      return Response.json(
        {
          success: false,
          error: 'Sensor not found',
        },
        { status: 404 }
      );
    }

    const readings = generateHistoricalReadings(sensor, 60);

    return Response.json({
      success: true,
      data: {
        sensor,
        readings,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch readings',
      },
      { status: 500 }
    );
  }
}
