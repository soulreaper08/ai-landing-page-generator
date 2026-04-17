import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const generation = await db.generation.findUnique({
      where: { id },
    })

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: generation })
  } catch (error) {
    console.error('Failed to fetch generation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch generation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const generation = await db.generation.findUnique({
      where: { id },
    })

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      )
    }

    await db.generation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Generation deleted' })
  } catch (error) {
    console.error('Failed to delete generation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete generation' },
      { status: 500 }
    )
  }
}
