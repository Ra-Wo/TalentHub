import { Badge } from "@/components/ui/badge";

type ApplicationStatus = "pending" | "reviewing" | "rejected" | "accepted";

/**
 * Render a coloured Badge for an application status value.
 */
export function StatusBadge({ status }: { status: ApplicationStatus }) {
  switch (status) {
    case "accepted":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
        >
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-500">
          Rejected
        </Badge>
      );
    case "reviewing":
      return (
        <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-500">
          Reviewing
        </Badge>
      );
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}
