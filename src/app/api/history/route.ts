import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const generations = await db.generation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        pageUrl: true,
        qualityScore: true,
        totalChanges: true,
        adImagePreview: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: generations })
  } catch (error) {
    console.error('Failed to fetch generation history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch generation history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      pageUrl,
      adImagePreview,
      qualityScore,
      totalChanges,
      htmlCode,
      originalHtml,
      aiExplanation,
      changes,
    } = body

    if (!pageUrl || !htmlCode || !changes) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: pageUrl, htmlCode, changes' },
        { status: 400 }
      )
    }

    const generation = await db.generation.create({
      data: {
        pageUrl,
        adImagePreview: adImagePreview || null,
        qualityScore: typeof qualityScore === 'number' ? qualityScore : 0,
        totalChanges: typeof totalChanges === 'number' ? totalChanges : 0,
        htmlCode,
        originalHtml: originalHtml || null,
        aiExplanation: aiExplanation || null,
        changes: typeof changes === 'string' ? changes : JSON.stringify(changes),
      },
    })

    return NextResponse.json({ success: true, data: generation }, { status: 201 })
  } catch (error) {
    console.error('Failed to create generation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create generation' },
      { status: 500 }
    )
  }
}
