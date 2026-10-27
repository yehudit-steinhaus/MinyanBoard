import { useQuery } from "@tanstack/react-query";
import { getSynagogues } from "../api/synagogues";

// Hook משלנו: רשימת בתי הכנסת מהשרת.
// מוגדר במקום אחד, ומשמש בהרשמה ובלוח.
export function useSynagogues() {
  return useQuery({
    queryKey: ["synagogues"],
    queryFn: getSynagogues,
  });
}
