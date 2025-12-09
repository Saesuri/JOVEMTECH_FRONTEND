import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomListSettings } from "../components/Settings/RoomListSettings";
import { RoomCategorySettings } from "../components/Settings/RoomCategorySettings";
import { UserManagement } from "../components/Settings/UserManagement";

const AdminSettings = () => {
  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Manage facilities, categories, and user access.
        </p>
      </div>

      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rooms">Room Management</TabsTrigger>
          <TabsTrigger value="categories">Categories (CMS)</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <RoomListSettings />
        </TabsContent>

        <TabsContent value="categories">
          <RoomCategorySettings />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
