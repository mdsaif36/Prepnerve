import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Interview AI action:', action);

    switch (action) {
      case 'generate_intro':
        return await generateIntro(params, LOVABLE_API_KEY);

      case 'generate_first_question':
        return await generateFirstQuestion(params, LOVABLE_API_KEY);
      
      case 'generate_next_question':
        return await generateNextQuestion(params, LOVABLE_API_KEY);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in interview-ai:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateIntro(params: { role: string; difficulty: string }, apiKey: string) {
  const { role } = params;
  
  const systemPrompt = `You are a professional ${role} interviewer.
  Generate a brief, warm, and professional introduction to start the interview session.
  
  RULES:
  1. Keep it under 3 sentences.
  2. Speak clearly and fluently. Do not use bullet points or markdown.
  3. Welcome the candidate and state that you will be asking a few questions to assess their fit.
  4. End by asking them to confirm when they are ready to begin.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-1.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the interview introduction.' }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function generateFirstQuestion(params: { cvSummary: any; role: string; difficulty: string }, apiKey: string) {
  const { cvSummary, role, difficulty } = params;
  
  const systemPrompt = `You are a friendly ${role} interviewer.
  
  Generate the FIRST question to break the ice.
  
  RULES:
  1. Keep it SHORT (1-2 sentences max).
  2. Speak naturally like a human, not a robot.
  3. Reference their CV summary to show you know them.
  4. Do not say "Let's start" again. Just ask the question.

CANDIDATE PROFILE:
${JSON.stringify(cvSummary, null, 2)}

Difficulty: ${difficulty}

Return JSON: { "question": "Spoken question text" }`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-1.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the first interview question.' }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function generateNextQuestion(params: {
  cvSummary: any;
  role: string;
  difficulty: string;
  conversationHistory: { question: string; answer: string; }[];
  questionCount: number;
  remainingMinutes: number;
}, apiKey: string) {
  const { cvSummary, role, difficulty, conversationHistory, questionCount, remainingMinutes } = params;

  const systemPrompt = `You are a ${role} interviewer.
  
  Evaluate the candidate's last answer and generate the next question.
  
  RULES:
  1. **CRITICAL: Keep "next_question" SHORT (1-2 sentences).** Long questions confuse TTS.
  2. Be conversational. If the answer was good, say "That makes sense" or "Good example" briefly before the next question.
  3. If the answer was bad/short, ask a clarifying question.
  4. Ensure the text is fluent english suitable for speech synthesis.

CANDIDATE PROFILE:
${JSON.stringify(cvSummary, null, 2)}

CONVERSATION SO FAR:
${conversationHistory.map((h, i) => `Q${i+1}: ${h.question}\nCandidate: ${h.answer}`).join('\n\n')}

Stats: ${questionCount} questions asked. ${remainingMinutes} mins left. Difficulty: ${difficulty}.

Return JSON:
{
  "next_question": "Spoken text for next question",
  "evaluation": {
    "score": number,
    "feedback": "Short feedback string"
  },
  "should_end": boolean
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-1.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate next question.' }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}