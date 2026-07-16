import { getAutobatchingData, getDelayReasonsData } from "@/lib/autobatching";
import Dashboard from "@/components/autobatching/Dashboard";

export default function AutobatchingPage() {
  const data = getAutobatchingData();
  const delayReasons = getDelayReasonsData();
  return (
    <Dashboard
      hub={data.hub}
      pre_range={data.pre_range}
      generated_at={data.generated_at}
      days={data.days}
      delayReasons={delayReasons}
    />
  );
}
