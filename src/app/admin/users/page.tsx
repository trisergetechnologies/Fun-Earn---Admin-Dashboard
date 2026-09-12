
import UsersView from "@/components/admin/users/UsersView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "User directory, package holders, and network management",
};

export default function BasicTables() {
  return <UsersView />;
}
