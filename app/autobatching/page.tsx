import { HUB_LIST, getAutobatchingDataForHub, getDelayReasonsForHub, getAllGeneratedAt } from "@/lib/autobatching";
import type { HubId } from "@/lib/autobatching";
import Dashboard from "@/components/autobatching/Dashboard";

export default function AutobatchingPage() {
  const allDays = HUB_LIST.flatMap(h => getAutobatchingDataForHub(h.id).days);
  const allDelayReasons = Object.fromEntries(
    HUB_LIST.map(h => [h.id, getDelayReasonsForHub(h.id)])
  ) as Record<HubId, ReturnType<typeof getDelayReasonsForHub>>;
  const allGeneratedAt = getAllGeneratedAt();

  return (
    <Dashboard
      hubList={HUB_LIST}
      days={allDays}
      allDelayReasons={allDelayReasons}
      allGeneratedAt={allGeneratedAt}
    />
  );
}
