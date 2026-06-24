import { getAiChatbotData } from "@/lib/data";
import Dashboard from "@/components/ai-chatbot/Dashboard";

export default function AiChatbotPage() {
  const data = getAiChatbotData();
  return <Dashboard {...data} />;
}
