import { generateReplyDeepseek } from "./deepseek";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export function generateReply(
  messages: Message[],
  system: string,
): Promise<string> {
  return generateReplyDeepseek(messages, system);
}
