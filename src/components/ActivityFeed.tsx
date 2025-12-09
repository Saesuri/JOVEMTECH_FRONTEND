import { useEffect, useState } from "react";
import { loggingService } from "../services/api";
import type { AuditLog } from "../types/apiTypes"; // <--- FIXED IMPORT
import { formatRelativeTime } from "../utils/formatters";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  Trash2,
  Edit,
  PlusCircle,
  Power,
  Settings,
} from "lucide-react";

export function ActivityFeed() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await loggingService.getLogs();
        setLogs(data);
      } catch (error) {
        console.error("Failed to load logs");
      }
    };
    fetchLogs();

    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (action: string) => {
    if (action.includes("DELETE") || action.includes("CANCEL"))
      return <Trash2 className="h-4 w-4 text-red-500" />;
    if (action.includes("CREATE"))
      return <PlusCircle className="h-4 w-4 text-green-500" />;
    if (action.includes("UPDATE"))
      return <Edit className="h-4 w-4 text-blue-500" />;
    if (action.includes("MAINTENANCE"))
      return <Power className="h-4 w-4 text-orange-500" />;
    if (action.includes("CONFIG") || action.includes("ROLE"))
      return <Settings className="h-4 w-4 text-purple-500" />;
    return <Activity className="h-4 w-4 text-slate-500" />;
  };

  return (
    <Card className="h-full border-l-4 border-l-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          System Activity
        </CardTitle>
        <CardDescription>Real-time audit log of user actions.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-6 pb-4">
          <div className="space-y-6">
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="h-10 w-10 opacity-20 mb-2" />
                <p>No activity recorded yet.</p>
              </div>
            )}

            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 group">
                <Avatar className="h-8 w-8 border bg-muted">
                  <AvatarFallback className="text-[10px] font-bold">
                    {log.profiles?.email?.substring(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>

                <div className="grid gap-1 w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {log.profiles?.email?.split("@")[0] || "Unknown User"}
                    </p>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {getIcon(log.action)}
                    <span className="font-semibold tracking-tight">
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 bg-muted/30 p-2 rounded-md mt-1 border border-transparent group-hover:border-border transition-colors">
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
