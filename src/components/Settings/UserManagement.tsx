import { useEffect, useState } from "react";
import { configService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
// IMPORT TYPE FROM TYPES FILE
import type { UserProfile } from "../../types/apiTypes";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users } from "lucide-react";

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await configService.getUsers();
      setUsers(data);
    } catch (e) {
      toast.error("Failed to load users");
    }
  };

  const toggleAdmin = async (targetUser: UserProfile) => {
    if (targetUser.id === currentUser?.id)
      return toast.error("Cannot change your own role");
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );

    try {
      await configService.updateUserRole(targetUser.id, newRole);
      toast.success(`User updated to ${newRole}`);
    } catch (e) {
      toast.error("Failed");
      loadUsers();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> User Access
        </CardTitle>
        <CardDescription>
          Grant Administrator privileges to other users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Admin Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    {u.email}{" "}
                    {u.id === currentUser?.id && (
                      <span className="text-muted-foreground text-xs">
                        (You)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={u.role === "admin"}
                      onCheckedChange={() => toggleAdmin(u)}
                      disabled={u.id === currentUser?.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
