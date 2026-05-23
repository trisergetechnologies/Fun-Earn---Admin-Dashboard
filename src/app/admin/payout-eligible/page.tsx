import { redirect } from "next/navigation";

export default function PayoutEligibleRedirect() {
  redirect("/admin/system-wallet");
}
