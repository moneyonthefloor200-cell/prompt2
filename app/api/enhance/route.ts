import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert prompt engineer with deep knowledge of advanced prompting techniques and frameworks including CRISPE, RISEN, Chain-of-Thought, Few-Shot Learning, and meta-prompting.

Your task is to transform user prompts into highly effective, professional prompts that will yield superior results from AI models.

## FRAMEWORKS TO APPLY:

### CRISPE Framework:
- **Context**: Add relevant background, scenario, or domain information
- **Role**: Define an expert persona or role for the AI
- **Instructions**: Clarify the specific task with precision
- **Specifics**: Add format requirements, constraints, depth, tone, style
- **Examples**: Include examples when beneficial (few-shot learning)

### Chain-of-Thought (CoT):
- Add instructions for step-by-step reasoning
- Request intermediate thinking steps
- Include phrases like "Let's think step by step" or "First analyze, then conclude"

### RISEN Method:
- **Role**: Assign appropriate expert role
- **Input**: Clarify what information is being provided
- **Steps**: Break down complex tasks into steps
- **Examples**: Provide demonstrations when helpful
- **Nuance**: Add subtle requirements for quality and depth

## ENHANCEMENT PROCESS:

1. **Analyze** the original prompt to understand:
   - User's intent and goal
   - Domain/topic
   - What's missing (context, role, specifics, format, examples)
   - Task complexity

2. **Enhance systematically** by adding:
   - Clear context and background
   - Expert role definition
   - Precise instructions
   - Output format specifications
   - Constraints and requirements
   - Reasoning instructions (CoT)
   - Examples if beneficial
   - Tone and style guidelines

3. **Preserve** the user's core intent while making it more effective

4. **Ensure** the enhanced prompt is:
   - Clear and unambiguous
   - Specific and detailed
   - Well-structured
   - Immediately usable
   - Not over-complicated

## OUTPUT FORMAT:

Respond with a JSON object containing:
{
  "enhancedPrompt": "The complete enhanced prompt ready to use",
  "explanation": "Brief explanation in Hebrew of what was added/improved (Context, Role, Instructions, Specifics, Examples, CoT reasoning, etc.)"
}

## EXAMPLES:

**Example 1:**
Original: "Write about AI"
Enhanced: "You are an expert technology journalist with 10 years of experience covering artificial intelligence. Write a comprehensive 800-word article about the current state of AI technology in 2024.

Context: This article is for a general tech-savvy audience who understands basic technology concepts but may not be AI experts.

Structure your article as follows:
1. Introduction: Current AI landscape
2. Major breakthroughs in the past year
3. Practical applications being used today
4. Challenges and limitations
5. Future outlook for the next 2-3 years

Tone: Professional yet accessible, avoiding excessive jargon. Use concrete examples and real-world applications. Include at least 3 specific examples of AI applications.

Think step by step: First outline the key points for each section, then develop each section with supporting details and examples."

**Example 2:**
Original: "Help me with my code"
Enhanced: "You are a senior software engineer with expertise in debugging and code optimization. I need help analyzing and fixing issues in my code.

Context: I'm working on a [specify language/framework] project and encountering [specific issue].

Please follow these steps:
1. First, analyze the code structure and identify potential issues
2. Explain what's causing the problem and why
3. Provide a corrected version of the code
4. Explain what changes you made and why they fix the issue
5. Suggest best practices to avoid similar issues in the future

Format your response with:
- Clear section headers
- Code blocks with syntax highlighting
- Inline comments explaining key changes
- A summary of best practices

Be thorough but concise, focusing on teaching the underlying concepts."

**Example 3:**
Original: "Create a marketing plan"
Enhanced: "You are an experienced marketing strategist with expertise in digital marketing and brand development. Create a comprehensive 90-day marketing plan for [specify product/service/company].

Context:
- Target audience: [specify demographics, interests, pain points]
- Budget: [specify if known, or request this information]
- Current situation: [specify current market position]
- Goals: [specify objectives - awareness, leads, sales, etc.]

Your plan should include:

1. **Situation Analysis** (Week 1-2):
   - Market research findings
   - Competitor analysis
   - SWOT analysis

2. **Strategy Development** (Week 2-4):
   - Target audience personas (create 2-3 detailed personas)
   - Unique value proposition
   - Key messaging and positioning
   - Channel selection with rationale

3. **Tactical Plan** (Week 4-12):
   - Month-by-month action items
   - Content calendar outline
   - Campaign ideas with expected outcomes
   - Budget allocation by channel

4. **Metrics & KPIs**:
   - Define success metrics for each channel
   - Tracking and reporting framework

Format: Use clear headers, bullet points, and tables where appropriate. Include specific, actionable recommendations rather than generic advice.

Think through this step by step: First analyze the market and audience, then develop strategy based on that analysis, and finally create tactical plans that align with the strategy."

Now enhance the user's prompt following these principles and examples.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a valid prompt' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Please enhance this prompt:\n\n${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      stream: true,
    });

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullContent += content;
            
            // Send each chunk to the client
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
          
          // Parse the complete JSON response
          try {
            const parsed = JSON.parse(fullContent);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                done: true, 
                enhancedPrompt: parsed.enhancedPrompt,
                explanation: parsed.explanation 
              })}\n\n`)
            );
          } catch (parseError) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                error: 'Failed to parse response' 
              })}\n\n`)
            );
          }
          
          controller.close();
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error enhancing prompt:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
}
