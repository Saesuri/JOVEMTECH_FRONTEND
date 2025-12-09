import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomListSettings } from "../components/Settings/RoomListSettings";
import { RoomCategorySettings } from "../components/Settings/RoomCategorySettings";
import { UserManagement } from "../components/Settings/UserManagement";

const AdminSettings = () => {
  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Configurações do Sistema
        </h2>
        <p className="text-muted-foreground">
          Gerenciar instalações, categorias e acesso de usuários.
        </p>
      </div>

      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rooms">Gerenciamento de Espaços</TabsTrigger>
          <TabsTrigger value="categories">Categorias (CMS)</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
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
