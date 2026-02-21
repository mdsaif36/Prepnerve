import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract readable text from file content
function extractTextFromFile(buffer: ArrayBuffer, fileName: string): string {
  const bytes = new Uint8Array(buffer);
  
  // For PDF files, extract text between stream markers and decode
  if (fileName.toLowerCase().endsWith('.pdf')) {
    let text = '';
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(bytes);
    
    // Extract text from PDF by finding readable content
    // Look for text between parentheses (PDF text objects) and other readable sections
    const lines = rawText.split('\n');
    for (const line of lines) {
      // Skip binary/encoded lines
      if (line.includes('stream') || line.includes('endstream')) continue;
      if (line.startsWith('%') && !line.includes('PDF')) continue;
      
      // Extract text from PDF text objects (content in parentheses)
      const textMatches = line.match(/\(([^)]+)\)/g);
      if (textMatches) {
        for (const match of textMatches) {
          const content = match.slice(1, -1);
          // Skip if mostly non-printable
          if (/^[\x20-\x7E\s]+$/.test(content) && content.length > 1) {
            text += content + ' ';
          }
        }
      }
      
      // Also capture HTML-like content from PDF annotations
      const htmlMatch = line.match(/&#(\d+);/g);
      if (htmlMatch) {
        const decoded = line.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
        text += decoded.replace(/<[^>]+>/g, ' ') + ' ';
      }
    }
    
    // Clean up extracted text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .trim();
    
    return text || rawText.replace(/[^\x20-\x7E\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  
  // For text files, decode directly
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Analyzing CV:', file.name, file.type, file.size);

    // Read and extract text from file
    const arrayBuffer = await file.arrayBuffer();
    const extractedText = extractTextFromFile(arrayBuffer, file.name);
    
    // Truncate if too long (max ~8000 chars for comprehensive analysis)
    const cvContent = extractedText.slice(0, 8000);
    
    console.log('Extracted CV content length:', cvContent.length);
    console.log('First 500 chars:', cvContent.slice(0, 500));

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert CV/Resume analyzer and career coach with 15+ years of experience in HR and recruitment.

Analyze the provided CV/Resume comprehensively and provide detailed scoring and feedback.

## SCORING CRITERIA (Calculate each category score 0-100):

1. **FORMATTING & STRUCTURE (20% of total)**
   - Clear section headings and organization
   - Consistent formatting and fonts
   - Appropriate length (1-2 pages ideal)
   - Proper use of whitespace and margins
   - Professional layout

2. **CONTENT QUALITY (25% of total)**
   - Relevant work experience descriptions
   - Quantified achievements with metrics
   - Clear job titles and company names
   - Proper date formatting
   - Logical career progression

3. **SKILLS PRESENTATION (20% of total)**
   - Technical skills clearly listed
   - Soft skills demonstrated
   - Skills relevant to target roles
   - Proficiency levels indicated
   - Industry-specific keywords

4. **ATS COMPATIBILITY (20% of total)**
   - Standard section headings
   - No complex tables or graphics
   - Proper keyword usage
   - Clean text formatting
   - Compatible file format

5. **PROFESSIONALISM (15% of total)**
   - Grammar and spelling accuracy
   - Professional language tone
   - Contact information complete
   - No personal/irrelevant info
   - Consistent tense usage

## OUTPUT FORMAT (STRICT JSON):
{
  "score": <weighted average 0-100>,
  "rating": "<Excellent (85-100) | Good (70-84) | Average (50-69) | Needs Improvement (0-49)>",
  "categoryScores": {
    "formatting": <0-100>,
    "content": <0-100>,
    "skills": <0-100>,
    "ats": <0-100>,
    "professionalism": <0-100>
  },
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>", "<specific strength 4>", "<specific strength 5>"],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>", "<specific weakness 3>", "<specific weakness 4>"],
  "atsScore": <0-100>,
  "atsIssues": ["<specific ATS issue if any>"],
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>", 
    "<actionable recommendation 3>",
    "<actionable recommendation 4>",
    "<actionable recommendation 5>"
  ],
  "keySkillsFound": ["<skill1>", "<skill2>", "<skill3>"],
  "summary": "<3-4 sentence executive summary of the CV quality and candidate profile>"
}

Be specific, actionable, and constructive in your feedback. Base scores on actual CV content.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this CV/Resume thoroughly:\n\n${cvContent}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    const aiResponse = data.choices[0].message.content;
    const analysis = JSON.parse(aiResponse);
    
    // Ensure all required fields exist with defaults
    const result = {
      score: analysis.score || 0,
      rating: analysis.rating || 'Unknown',
      categoryScores: analysis.categoryScores || {
        formatting: 0,
        content: 0,
        skills: 0,
        ats: 0,
        professionalism: 0
      },
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      atsScore: analysis.atsScore || analysis.categoryScores?.ats || 0,
      atsIssues: analysis.atsIssues || [],
      recommendations: analysis.recommendations || [],
      keySkillsFound: analysis.keySkillsFound || [],
      summary: analysis.summary || 'Analysis complete.'
    };
    
    console.log('Analysis complete, overall score:', result.score);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-cv:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        score: 0,
        rating: 'Error',
        categoryScores: {
          formatting: 0,
          content: 0,
          skills: 0,
          ats: 0,
          professionalism: 0
        },
        strengths: [],
        weaknesses: ['Failed to analyze CV - please try again'],
        atsScore: 0,
        atsIssues: [],
        recommendations: ['Please try uploading a different file format (TXT, DOCX, or PDF)'],
        keySkillsFound: [],
        summary: 'Analysis failed. Please try again with a different file.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
