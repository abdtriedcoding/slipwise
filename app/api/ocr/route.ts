import { NextResponse } from 'next/server';
import { extractReceiptJson } from '@/lib/client';
import { z } from 'zod';
import { ProcessedReceiptSchema } from '@/lib/types';
import {
  DAILY_RECEIPT_LIMIT,
  checkOcrRateLimit,
  getClientIp,
} from '@/lib/rate-limit';
import {
  MAX_BASE64_LENGTH,
  MAX_REQUEST_BYTES,
  detectImageType,
} from '@/lib/input-limits';

const invalidImageResponse = () =>
  NextResponse.json(
    { error: 'Unsupported image. Please upload a JPEG, PNG or WebP image.' },
    { status: 400 }
  );

const tooLargeResponse = () =>
  NextResponse.json(
    { error: 'Image is too large. Please upload a smaller image.' },
    { status: 413 }
  );

const extractionSchema = z.object({
  receipts: z.array(
    z.object({
      date: z.string(),
      vendor: z.string(),
      category: z.string(),
      paymentMethod: z.string(),
      taxAmount: z.number(),
      amount: z.number(),
      currency: z.string(),
    })
  ),
});

const SYSTEM_PROMPT = `Extract each receipt in the image. Return JSON only.
- date: YYYY-MM-DD
- currency: 3-letter ISO code, default USD
- taxAmount and amount: numbers
- category: one of groceries, dining, gas, healthcare, shopping, electronics, home, clothing, utilities, entertainment, travel, other
- paymentMethod: cash, credit, debit, check, gift card, or digital wallet`;

function sanitizeSchema(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid extraction schema');
  }
  const clean: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (key.startsWith('$')) continue;
    clean[key] = item;
  }
  return clean;
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length'));
    if (contentLength > MAX_REQUEST_BYTES) {
      return tooLargeResponse();
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_BYTES) {
      return tooLargeResponse();
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const base64Image =
      body && typeof body === 'object'
        ? (body as { base64Image?: unknown }).base64Image
        : undefined;

    if (!base64Image || typeof base64Image !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: base64Image' },
        { status: 400 }
      );
    }

    if (base64Image.length > MAX_BASE64_LENGTH) {
      return tooLargeResponse();
    }

    const mimeType = detectImageType(base64Image);
    if (!mimeType) {
      return invalidImageResponse();
    }

    const rateLimit = await checkOcrRateLimit(getClientIp(request.headers));

    if (rateLimit === 'unavailable') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    if (rateLimit === 'limited') {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: `You've reached the limit of ${DAILY_RECEIPT_LIMIT} receipts per day. Please slow down or try again later.`,
        },
        { status: 429 }
      );
    }

    const jsonSchema = sanitizeSchema(z.toJSONSchema(extractionSchema));

    const content = await extractReceiptJson({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: 'Extract the receipt data as JSON.',
      imageDataUrl: `data:${mimeType};base64,${base64Image}`,
      schema: jsonSchema,
    });

    if (!content) {
      return NextResponse.json(
        { error: 'OCR extraction failed' },
        { status: 502 }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: 'OCR extraction failed' },
        { status: 502 }
      );
    }

    const validated = extractionSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.error(
        'OCR validation failed:',
        validated.error.issues.length,
        'schema issues'
      );
      return NextResponse.json(
        { error: 'Could not read receipt data from this image' },
        { status: 422 }
      );
    }

    const receipts = validated.data.receipts.map((receipt) =>
      ProcessedReceiptSchema.parse({
        ...receipt,
        id: '',
        fileName: '',
        thumbnail: '',
        base64: '',
        mimeType,
      })
    );

    return NextResponse.json({ receipts });
  } catch (error) {
    console.error(
      '/api/ocr error',
      error instanceof Error ? error.name : 'unknown error',
      error instanceof Error ? error.message : ''
    );
    return NextResponse.json(
      { error: 'Internal error while performing OCR' },
      { status: 500 }
    );
  }
}
