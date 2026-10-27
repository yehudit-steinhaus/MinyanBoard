// תיבת סינון: אפשרות "הכל" + רשימת אפשרויות
// משמשת בלוח הציבורי ובדף המנהל
type Option = { value: string; label: string };

type SelectFilterProps = {
  value: string;                     // מה נבחר כרגע ("" = הכל)
  onChange: (value: string) => void; // מה לעשות כשבוחרים משהו
  allLabel: string;                  // הטקסט של האפשרות "הכל"
  options: Option[];                 // שאר האפשרויות
};

function SelectFilter({ value, onChange, allLabel, options }: SelectFilterProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default SelectFilter;
