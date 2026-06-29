import { getAiChatbotWowData } from "@/lib/ai-chatbot-wow";
import Dashboard from "@/components/ai-chatbot-wow/Dashboard";

export default function AiChatbotWowPage() {
  const data = getAiChatbotWowData();
  return <Dashboard {...data} />;
}
