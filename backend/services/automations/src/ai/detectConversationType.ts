import { generateTextCF } from '@/ai/generateTextCF';

export async function detectConversationType(
  question: string,
): Promise<boolean> {
  try {
    const prompt = `
        Analyze the following user message and determine if it's a general conversation (like greetings, casual chat, asking for help) or a specific question that would require looking up information from documents/files.
  
        User Message: "${question}"
  
        Please respond with ONLY "general" if it's general conversation, or "specific" if it's a question that would need document/file information.
  
        Examples:
        - "Hello" → general
        - "How are you?" → general  
        - "What can you do?" → general
        - "What is erxes?" → specific
        - "What are the features?" → specific
        - "How to install?" → specific
        - "Tell me about the requirements" → specific
        
        response me as just one word is it casual question or not
        Response:`;

    const response = await generateTextCF(prompt);
    return response.toLowerCase().includes('general');
  } catch (error) {
    console.error('Error detecting conversation type:', error);

    // Fallback to simple detection for common cases
    const questionLower = question.toLowerCase().trim();
    const generalPatterns = [
      'hello',
      'hi',
      'hey',
      'how are you',
      "what's up",
      'help',
    ];

    return generalPatterns.some((pattern) => questionLower.includes(pattern));
  }
}
