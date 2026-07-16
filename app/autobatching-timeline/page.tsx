import { getAutobatchingData } from "@/lib/autobatching";
import { AutobatchingTimeline } from "@/components/autobatching/Timeline";

export default function TimelinePage() {
  const data = getAutobatchingData();
  return <AutobatchingTimeline allDays={data.days} />;
}
