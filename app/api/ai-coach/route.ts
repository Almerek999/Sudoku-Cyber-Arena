import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Извлекаем ключ и сразу чистим его от возможных пробелов/переносов
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    // Лог для терминала (не для браузера!)
    console.log("--- [AI COACH DEBUG] ---");
    console.log("Key Loaded:", apiKey ? `YES (Starts with: ${apiKey.slice(0, 7)}...)` : "NO (MISSING)");

    if (!apiKey) {
      return NextResponse.json(
        { message: "[СИСТЕМА]: Ключ не найден в .env.local. Перезапусти терминал (Ctrl+C -> npm run dev)." },
        { status: 500 }
      );
    }

    const { board, row, col, answer } = await req.json();

    // 2. Формируем запрос к OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "Ты — кибер-инструктор по судоку в неоновом стиле. Твоя задача — кратко и технично объяснить логику хода." 
          },
          { 
            role: "user", 
            content: `Объясни, почему в клетке [${row + 1},${col + 1}] должна стоять цифра ${answer}. Текущее поле: ${JSON.stringify(board)}. Ответь в 2 коротких предложениях.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();

    // 3. Обработка специфических ошибок API
    if (!response.ok) {
      console.error("--- [OPENAI ERROR] ---", data);
      
      if (response.status === 401) {
        return NextResponse.json(
          { message: "[ОШИБКА ДОСТУПА]: Ключ невалиден. Скорее всего, он был аннулирован после утечки. Создай НОВЫЙ ключ в панели OpenAI." },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { message: `[API ERROR]: ${data.error?.message || 'Неизвестный сбой'}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: data.choices[0].message.content });

  } catch (error: any) {
    console.error("--- [CRITICAL BACKEND ERROR] ---", error);
    return NextResponse.json(
      { message: `[КРИТИЧЕСКИЙ СБОЙ]: ${error.message}` },
      { status: 500 }
    );
  }
}