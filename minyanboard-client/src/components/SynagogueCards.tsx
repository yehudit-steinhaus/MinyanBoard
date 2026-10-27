import synagogueImage from "../assets/synagogue.svg";
import type { Synagogue } from "../types";

// כרטיסים של בתי הכנסת. לחיצה על כרטיס מסננת את הלוח לפי בית הכנסת.
type SynagogueCardsProps = {
  synagogues: Synagogue[];
  selectedId: string;               // בית הכנסת שנבחר כרגע ("" = הכל)
  onSelect: (id: string) => void;   // מה לעשות בלחיצה - הדף מחליט
};

function SynagogueCards({ synagogues, selectedId, onSelect }: SynagogueCardsProps) {
  return (
    <div className="synagogue-cards">
      {synagogues.map((s) => {
        const id = String(s.id);
        const selected = id === selectedId;
        return (
          <article
            key={s.id}
            className={selected ? "synagogue-card selected" : "synagogue-card"}
            onClick={() => onSelect(selected ? "" : id)} // לחיצה שנייה מבטלת את הסינון
          >
            <img src={synagogueImage} alt="" />
            <strong>{s.name}</strong>
            <small>
              {s.address}
              {s.neighborhood && ` · ${s.neighborhood}`}
            </small>
          </article>
        );
      })}
    </div>
  );
}

export default SynagogueCards;
