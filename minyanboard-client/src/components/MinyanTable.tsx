import type { ReactNode } from "react";
import type { Minyan } from "../types";
import { dayLabels, formatTime, prayerLabels, statusLabels } from "../labels";

type MinyanTableProps = {
  minyanim: Minyan[];
  showStatus?: boolean;                    // להציג עמודת סטטוס? (גבאי ומנהל)
  actions?: (minyan: Minyan) => ReactNode; // כפתורים לכל שורה (עריכה / אישור...)
};

function MinyanTable({ minyanim, showStatus = false, actions }: MinyanTableProps) {
  if (minyanim.length === 0) return <p>אין מניינים להצגה</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>בית כנסת</th>
          <th>תפילה</th>
          <th>ימים</th>
          <th>שעה</th>
          <th>הערות</th>
          {showStatus && <th>סטטוס</th>}
          {actions && <th>פעולות</th>}
        </tr>
      </thead>
      <tbody>
        {minyanim.map((m) => (
          <tr key={m.id}>
            <td>{m.synagogueName}</td>
            <td>{prayerLabels[m.prayer]}</td>
            <td>{dayLabels[m.days]}</td>
            <td>{formatTime(m.time)}</td>
            <td>{m.notes}</td>
            {showStatus && <td>{statusLabels[m.status]}</td>}
            {actions && <td>{actions(m)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MinyanTable;