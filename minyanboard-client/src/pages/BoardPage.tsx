import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBoard } from "../api/minyanim";
import { useSynagogues } from "../hooks/useSynagogues";
import Hero from "../components/Hero";
import SynagogueCards from "../components/SynagogueCards";
import MinyanTable from "../components/MinyanTable";
import SelectFilter from "../components/SelectFilter";
import { dayLabels, prayerLabels, toOptions } from "../labels";
import type { BoardFilters, DayType, Prayer } from "../types";

function BoardPage() {
  // הסינון שהמשתמש בחר - "" = הכל
  const [filters, setFilters] = useState<BoardFilters>({
    prayer: "",
    days: "",
    synagogueId: "",
  });

  const { data: synagogues } = useSynagogues();

  // filters נמצא בתוך queryKey: כל שינוי בסינון => בקשה חדשה לשרת
  const { data: minyanim, isLoading, error } = useQuery({
    queryKey: ["minyanim", "board", filters],
    queryFn: () => getBoard(filters),
  });

  return (
    <div>
      <Hero />

      <h2>בתי הכנסת</h2>
      {synagogues && (
        <SynagogueCards
          synagogues={synagogues}
          selectedId={filters.synagogueId}
          onSelect={(id) => setFilters({ ...filters, synagogueId: id })}
        />
      )}

      <h2>לוח מניינים</h2>
      <div className="filters">
        <SelectFilter
          value={filters.prayer}
          allLabel="כל התפילות"
          options={toOptions(prayerLabels)}
          onChange={(value) => setFilters({ ...filters, prayer: value as Prayer | "" })}
        />
        <SelectFilter
          value={filters.days}
          allLabel="כל הימים"
          options={toOptions(dayLabels)}
          onChange={(value) => setFilters({ ...filters, days: value as DayType | "" })}
        />
        <SelectFilter
          value={filters.synagogueId}
          allLabel="כל בתי הכנסת"
          options={synagogues?.map((s) => ({ value: String(s.id), label: s.name })) ?? []}
          onChange={(value) => setFilters({ ...filters, synagogueId: value })}
        />
      </div>

      {isLoading && <p aria-busy="true">טוען...</p>}
      {error && <p className="error">{error.message}</p>}
      {minyanim && <MinyanTable minyanim={minyanim} />}
    </div>
  );
}

export default BoardPage;
