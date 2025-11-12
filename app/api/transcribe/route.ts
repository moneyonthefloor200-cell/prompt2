import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for OpenAI API
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a File object that OpenAI SDK expects
    const file = new File([buffer], 'audio.webm', { type: audioFile.type });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'he', // Hebrew - but Whisper auto-detects if needed
      response_format: 'json',
      temperature: 0.2, // Lower temperature for more accurate transcription
    });

    return NextResponse.json({
      text: transcription.text,
      success: true,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to transcribe audio',
        success: false 
      },
      { status: 500 }
    );
  }
}
