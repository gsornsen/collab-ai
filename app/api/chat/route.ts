import { createStreamableValue } from "ai/rsc";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage } from "@langchain/core/messages";
import { StreamingTextResponse, LangChainStream } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, model, apiKey } = await req.json();
  
  const { stream, handlers } = LangChainStream();

  let llm;

  if (model === "GPT-4o") {
    llm = new ChatOpenAI({
      modelName: "gpt-4",
      openAIApiKey: apiKey,
      streaming: true,
    });
  } else if (model === "Sonnet 3.5") {
    llm = new ChatAnthropic({
      anthropicApiKey: apiKey,
      modelName: "claude-3-5-sonnet-20240620",
      streaming: true,
    });
  } else {
    throw new Error(`Invalid model specified: ${model}`);
  }

  // Start the streaming process
  llm.invoke([new HumanMessage(messages[messages.length - 1].content)], {
    callbacks: [handlers],
  });

  return new StreamingTextResponse(stream);
}
