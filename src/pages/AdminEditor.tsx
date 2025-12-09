import { useState, useEffect } from "react";
import { toast } from "sonner";

// Components
import GridCanvas from "../components/MapEditor/GridCanvas";
import RoomEditModal from "../components/Modals/RoomEditModal";
import FloorManagerModal from "../components/Modals/FloorManagerModal";

// Services & Utils
import { floorService, spaceService } from "../services/api";
import { mapSpacesToShapes } from "../utils/mapHelpers";
import type { Floor, CreateSpaceDTO, RoomShape } from "../types/apiTypes";

// Shadcn UI & Icons
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MousePointer2,
  Square,
  Hexagon,
  Save,
  Layers,
  Settings2,
  Plus,
  LayoutTemplate,
} from "lucide-react";

function AdminEditor() {
  // --- STATE ---
  const [rooms, setRooms] = useState<RoomShape[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedRoom, setSelectedRoom] = useState<RoomShape | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isFloorManagerOpen, setIsFloorManagerOpen] = useState(false);

  // Onboarding State
  const [firstFloorName, setFirstFloorName] = useState("");

  // Tool State
  const [activeTool, setActiveTool] = useState<"select" | "rect" | "polygon">(
    "select"
  );

  // Helper to determine if we are in "Onboarding Mode"
  const showOnboarding = !loading && floors.length === 0;

  // --- 1. LOAD FLOORS ---
  useEffect(() => {
    const initFloors = async () => {
      try {
        const existingFloors = await floorService.getAll();
        if (existingFloors.length > 0) {
          setFloors(existingFloors);
          setSelectedFloorId(existingFloors[0].id);
        } else {
          setFloors([]);
          setSelectedFloorId("");
        }
      } catch (error) {
        console.error("Error loading floors:", error);
        toast.error("Falha ao carregar o pavimento");
      } finally {
        setLoading(false);
      }
    };
    initFloors();
  }, []);

  // --- 2. LOAD SPACES ---
  useEffect(() => {
    if (!selectedFloorId) return;
    const loadSpaces = async () => {
      try {
        const dbSpaces = await spaceService.getAll(selectedFloorId);
        setRooms(mapSpacesToShapes(dbSpaces));
      } catch (error) {
        console.error("Error loading spaces:", error);
      }
    };
    loadSpaces();
  }, [selectedFloorId]);

  // --- HANDLERS ---
  const handleCreateFirstFloor = async () => {
    if (!firstFloorName.trim()) return toast.error("Por favor, insira um nome");
    await handleCreateFloor(firstFloorName);
    setFirstFloorName("");
  };

  const handleCreateFloor = async (name: string) => {
    try {
      const newFloor = await floorService.create({
        name,
        width: 800,
        height: 600,
      });
      setFloors((prev) => [...prev, newFloor]);
      setSelectedFloorId(newFloor.id);
      toast.success("Pavimento criado com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao criar o pavimento");
    }
  };

  const handleRenameFloor = async (id: string, name: string) => {
    try {
      await floorService.update(id, name);
      setFloors(floors.map((f) => (f.id === id ? { ...f, name } : f)));
      toast.success("Pavimento renomeado com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao renomear o pavimento");
    }
  };

  const handleDeleteFloor = async (id: string) => {
    try {
      await floorService.delete(id);
      const remaining = floors.filter((f) => f.id !== id);
      setFloors(remaining);
      if (remaining.length > 0) setSelectedFloorId(remaining[0].id);
      else setSelectedFloorId("");
      toast.success("Pavimento excluído com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao excluir o pavimento");
    }
  };

  const handleRoomClick = (room: RoomShape) => {
    if (activeTool === "select") {
      setSelectedRoom(room);
      setIsRoomModalOpen(true);
    }
  };

  const handleUpdateRoom = async (
    id: string,
    updates: {
      name: string;
      capacity: number;
      type: string;
      amenities: string[];
    }
  ) => {
    try {
      await spaceService.update(id, updates);
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      toast.success("Espaço atualizado com sucesso!");
    } catch (e) {
      console.error(e);
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      toast("Espaço atualizado localmente", { icon: "⚠️" });
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await spaceService.delete(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      toast.success("Espaço excluído com sucesso!");
    } catch (e) {
      console.error(e);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      toast.info("Espaço excluído localmente", { icon: "⚠️" });
    }
  };

  const handleSave = async () => {
    if (!selectedFloorId) {
      toast.error("Nenhum pavimento selecionado");
      return;
    }

    const promise = (async () => {
      const promises = rooms.map((room) => {
        // Prepare Payload - include all room properties
        const payload: CreateSpaceDTO = {
          id: room.id,
          floor_id: selectedFloorId,
          name: room.name,
          type: room.type || "meeting_room",
          capacity: room.capacity || 10,
          amenities: room.amenities || [],
          coordinates: room.data,
        };
        return spaceService.create(payload);
      });

      await Promise.all(promises);

      // Refresh to ensure everything is synced
      const dbSpaces = await spaceService.getAll(selectedFloorId);
      setRooms(mapSpacesToShapes(dbSpaces));
    })();

    toast.promise(promise, {
      loading: "Salvando layout...",
      success: "Layout salvo com sucesso!",
      error: "Falha ao salvar o layout",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      {/* 
        ---------------------------------------------------------
        1. ONBOARDING OVERLAY
        ---------------------------------------------------------
      */}
      {showOnboarding && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-[1px] transition-all duration-500">
          {/* Added -mt-32 to lift the card up from the exact center */}
          <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20 animate-in fade-in zoom-in-95 duration-300 -mt-32">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <LayoutTemplate className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Bem-vindo ao Editor de Mapa
              </CardTitle>
              <CardDescription>
                Seu espaço de trabalho está vazio. Crie a planta do primeiro
                pavimento para desbloquear as ferramentas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Primeiro Pavimento</Label>
                <Input
                  placeholder="e.g. Ground Floor"
                  value={firstFloorName}
                  onChange={(e) => setFirstFloorName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleCreateFirstFloor()
                  }
                  autoFocus
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCreateFirstFloor}
                className="w-full gap-2"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                Criar Primeiro Pavimento
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* 
        ---------------------------------------------------------
        2. MAIN EDITOR UI
        ---------------------------------------------------------
      */}
      <div
        className={`container mx-auto p-6 space-y-6 transition-all duration-500 ${
          showOnboarding
            ? "blur-[2px] opacity-60 pointer-events-none" // Subtler blur (2px) and higher opacity (60)
            : ""
        }`}
      >
        {/* TOOLBAR CARD */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Editor de Pavimentos</CardTitle>
                  <CardDescription>
                    Planeje o layout do seu espaço.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-muted-foreground">
                  {rooms.length} Salas
                </Badge>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Layout
                </Button>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              {/* Left: Floor Selector + Settings */}
              <div className="w-full md:w-[300px] space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Pavimento Ativo
                </label>

                <div className="flex gap-2">
                  <Select
                    value={selectedFloorId}
                    onValueChange={setSelectedFloorId}
                    disabled={showOnboarding}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {floors.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFloorManagerOpen(true)}
                    title="Manage Floors"
                    disabled={showOnboarding}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Right: Tools */}
              <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                <Button
                  variant={activeTool === "select" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTool("select")}
                  className="gap-2"
                >
                  <MousePointer2 className="h-4 w-4" />
                  Selecionar
                </Button>
                <Button
                  variant={activeTool === "rect" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTool("rect")}
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Retângulo
                </Button>
                <Button
                  variant={activeTool === "polygon" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTool("polygon")}
                  className="gap-2"
                >
                  <Hexagon className="h-4 w-4" />
                  Polígono
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CANVAS AREA */}
        <div className="flex justify-center border rounded-lg bg-card p-4 shadow-sm relative overflow-hidden min-h-[600px] items-center">
          <GridCanvas
            width={800}
            height={600}
            snapSize={20}
            rectangles={rooms}
            setRectangles={setRooms}
            tool={activeTool}
            readOnly={false}
            onRoomClick={handleRoomClick}
          />

          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur p-3 rounded-md border text-xs text-muted-foreground shadow-sm">
            <strong>Instructions:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                <strong>Selecionar:</strong> Clique na sala para editar/excluir.
                Arraste para mover.
              </li>
              <li>
                <strong>Retângulo:</strong> Arraste para desenhar.
              </li>
              <li>
                <strong>Polígono:</strong> Clique nos pontos indicados e clique
                duas vezes para fechar.
              </li>
            </ul>
          </div>
        </div>

        {/* MODALS */}
        <RoomEditModal
          key={selectedRoom?.id || "empty"}
          room={selectedRoom}
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          onSave={handleUpdateRoom}
          onDelete={handleDeleteRoom}
        />

        <FloorManagerModal
          isOpen={isFloorManagerOpen}
          onClose={() => setIsFloorManagerOpen(false)}
          currentFloorId={selectedFloorId}
          currentFloorName={
            floors.find((f) => f.id === selectedFloorId)?.name || ""
          }
          onCreate={handleCreateFloor}
          onRename={handleRenameFloor}
          onDelete={handleDeleteFloor}
        />
      </div>
    </div>
  );
}

export default AdminEditor;
