import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Stage, Layer, Line, Rect, Circle, Group, Text } from "react-konva";
import Konva from "konva";
import type { RoomShape, RectCoordinates } from "../../types/apiTypes";
import { toast } from "sonner";
import {
  Users,
  Wifi,
  Tv,
  Projector,
  Monitor,
  Mic,
  Wind,
  Ban,
} from "lucide-react";

interface GridCanvasProps {
  width: number;
  height: number;
  snapSize?: number;
  rectangles: RoomShape[];
  setRectangles?: React.Dispatch<React.SetStateAction<RoomShape[]>>;
  tool: "select" | "rect" | "polygon";
  readOnly?: boolean;
  onRoomClick?: (room: RoomShape) => void;
  occupiedIds?: string[];
  dimmedIds?: string[];
}

const GridCanvas: React.FC<GridCanvasProps> = ({
  width,
  height,
  snapSize = 20,
  rectangles,
  setRectangles,
  tool,
  readOnly = false,
  onRoomClick,
  occupiedIds = [],
  dimmedIds = [],
}) => {
  // --- STATE ---
  const [newRect, setNewRect] = useState<RectCoordinates | null>(null);
  const [polyPoints, setPolyPoints] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Hover Tooltip State
  const [hoveredRoom, setHoveredRoom] = useState<{
    x: number;
    y: number;
    data: RoomShape;
  } | null>(null);

  // Ref for container to calculate screen position
  const containerRef = useRef<HTMLDivElement>(null);

  const isDrawing = useRef<boolean>(false);

  // --- EFFECT: ESCAPE KEY ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (newRect) {
          setNewRect(null);
          isDrawing.current = false;
        }
        if (polyPoints.length > 0) {
          setPolyPoints([]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [newRect, polyPoints]);

  // --- HELPERS ---
  const snap = (val: number): number => Math.round(val / snapSize) * snapSize;

  const getFillColor = (room: RoomShape) => {
    // Check Maintenance (is_active defaults to true if undefined)
    const isActive = room.is_active !== false;

    if (!isActive) return "#e2e8f0"; // Gray (Maintenance)
    if (occupiedIds.includes(room.id)) return "#fee2e2"; // Light Red (Occupied)

    // Admin Mode (Blue) vs User Mode (Green)
    if (!readOnly) return "#bfdbfe"; // Blue-200
    return "#dcfce7"; // Green-100 (Available)
  };

  const getStrokeColor = (room: RoomShape) => {
    const isActive = room.is_active !== false;
    if (!isActive) return "#94a3b8"; // Slate-400
    if (occupiedIds.includes(room.id)) return "#ef4444"; // Red-500
    if (!readOnly) return "#3b82f6"; // Blue-500
    return "#22c55e"; // Green-500
  };

  const renderAmenityIcon = (type: string) => {
    const props = { className: "h-3 w-3" };
    switch (type) {
      case "wifi":
        return <Wifi {...props} />;
      case "tv":
        return <Tv {...props} />;
      case "projector":
        return <Projector {...props} />;
      case "video_conf":
        return <Monitor {...props} />;
      case "mic":
        return <Mic {...props} />;
      case "ac":
        return <Wind {...props} />;
      default:
        return null;
    }
  };

  // --- MOUSE HANDLERS ---
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (readOnly) return;
    if (tool === "select") return;

    const stage = e.target.getStage();
    if (!stage) return;
    const { x, y } = stage.getPointerPosition() || { x: 0, y: 0 };
    const snX = snap(x);
    const snY = snap(y);

    if (tool === "rect") {
      isDrawing.current = true;
      setNewRect({ x: snX, y: snY, width: 0, height: 0 });
    } else if (tool === "polygon") {
      if (polyPoints.length >= 6) {
        const startX = polyPoints[0];
        const startY = polyPoints[1];
        const dist = Math.sqrt(
          Math.pow(snX - startX, 2) + Math.pow(snY - startY, 2)
        );
        if (dist < 10) {
          finishPolygon();
          return;
        }
      }
      setPolyPoints((prev) => [...prev, snX, snY]);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const { x, y } = stage.getPointerPosition() || { x: 0, y: 0 };
    const snX = snap(x);
    const snY = snap(y);

    setMousePos({ x: snX, y: snY });

    // Update Tooltip Position if active (use native event for screen coords)
    if (hoveredRoom && e.evt) {
      setHoveredRoom((prev) =>
        prev ? { ...prev, x: e.evt.clientX, y: e.evt.clientY } : null
      );
    }

    if (readOnly) return;

    if (tool === "rect" && isDrawing.current && newRect) {
      setNewRect({
        ...newRect,
        width: snX - newRect.x,
        height: snY - newRect.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (readOnly) return;

    if (tool === "rect" && isDrawing.current && newRect && setRectangles) {
      isDrawing.current = false;
      if (Math.abs(newRect.width) > 0 && Math.abs(newRect.height) > 0) {
        const newRoom: RoomShape = {
          id: crypto.randomUUID(),
          name: "New Room",
          shapeType: "rect",
          data: newRect,
        };
        setRectangles((prev) => [...prev, newRoom]);
      }
      setNewRect(null);
    }
  };

  const finishPolygon = () => {
    if (readOnly || !setRectangles) return;
    if (polyPoints.length < 6) return;

    const newRoom: RoomShape = {
      id: crypto.randomUUID(),
      name: "New Poly",
      shapeType: "polygon",
      data: { points: polyPoints },
    };

    setRectangles((prev) => [...prev, newRoom]);
    setPolyPoints([]);
  };

  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i <= width / snapSize; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * snapSize, 0, i * snapSize, height]}
          stroke="#f1f5f9"
          strokeWidth={1}
        />
      );
    }
    for (let j = 0; j <= height / snapSize; j++) {
      lines.push(
        <Line
          key={`h-${j}`}
          points={[0, j * snapSize, width, j * snapSize]}
          stroke="#f1f5f9"
          strokeWidth={1}
        />
      );
    }
    return lines;
  };

  return (
    <div
      ref={containerRef}
      className="border border-slate-200 inline-block bg-white shadow-sm rounded-lg overflow-hidden cursor-crosshair relative"
    >
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setHoveredRoom(null)}
        onDblClick={() => !readOnly && tool === "polygon" && finishPolygon()}
      >
        <Layer>
          {renderGrid()}

          {rectangles.map((room) => {
            const isRect = room.shapeType === "rect";
            const fillColor = getFillColor(room);
            const strokeColor = getStrokeColor(room);
            const isActive = room.is_active !== false;

            // Filters logic
            const isDimmed = dimmedIds.includes(room.id);
            const opacity = isDimmed ? 0.1 : 0.9;

            // Center Text Logic
            let textX = 0,
              textY = 0;
            if (isRect) {
              textX = room.data.x + room.data.width / 2;
              textY = room.data.y + room.data.height / 2;
            } else {
              const points = room.data.points;
              const xCoords = points.filter((_, i) => i % 2 === 0);
              const yCoords = points.filter((_, i) => i % 2 !== 0);
              textX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2;
              textY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2;
            }

            return (
              <Group
                key={room.id}
                opacity={opacity}
                onClick={() => {
                  if (isDimmed) return;
                  if (!isActive && readOnly) {
                    toast("This room is currently under maintenance", {
                      icon: <Ban className="h-4 w-4 text-red-500" />,
                    });
                    return;
                  }
                  onRoomClick?.(room);
                }}
                onTap={() => {
                  if (isDimmed || (!isActive && readOnly)) return;
                  onRoomClick?.(room);
                }}
                onMouseEnter={(e) => {
                  if (isDimmed) return;
                  const stage = e.target.getStage();
                  if (stage) {
                    if (!isActive && readOnly)
                      stage.container().style.cursor = "not-allowed";
                    else stage.container().style.cursor = "pointer";
                  }
                  // Show Tooltip - use native event for screen coordinates
                  const nativeEvt = e.evt as MouseEvent;
                  if (nativeEvt) {
                    setHoveredRoom({
                      x: nativeEvt.clientX,
                      y: nativeEvt.clientY,
                      data: room,
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = "default";
                  setHoveredRoom(null);
                }}
                draggable={!readOnly && tool === "select" && !isDimmed}
                onDragEnd={(e) => {
                  if (readOnly || !setRectangles) return;
                  const node = e.target;
                  const x = Math.round(node.x() / snapSize) * snapSize;
                  const y = Math.round(node.y() / snapSize) * snapSize;
                  node.position({ x: 0, y: 0 });

                  setRectangles((prev) =>
                    prev.map((r): RoomShape => {
                      if (r.id !== room.id) return r;
                      if (r.shapeType === "rect") {
                        return {
                          ...r,
                          data: {
                            ...r.data,
                            x: r.data.x + x,
                            y: r.data.y + y,
                          },
                        };
                      }
                      return r;
                    })
                  );
                }}
              >
                {isRect ? (
                  <Rect
                    x={room.data.x}
                    y={room.data.y}
                    width={room.data.width}
                    height={room.data.height}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2}
                    shadowColor="black"
                    shadowBlur={hoveredRoom?.data.id === room.id ? 10 : 0}
                    shadowOpacity={0.2}
                  />
                ) : (
                  <Line
                    points={room.data.points}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2}
                    closed={true}
                    shadowColor="black"
                    shadowBlur={hoveredRoom?.data.id === room.id ? 10 : 0}
                    shadowOpacity={0.2}
                  />
                )}

                <Text
                  x={textX}
                  y={textY}
                  text={room.name}
                  fontSize={11}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill="#334155" // Slate-700
                  align="center"
                  verticalAlign="middle"
                  offsetX={room.name.length * 3}
                  offsetY={5}
                  listening={false}
                />
              </Group>
            );
          })}

          {!readOnly && newRect && (
            <Rect
              x={newRect.x}
              y={newRect.y}
              width={newRect.width}
              height={newRect.height}
              fill="#22c55e"
              opacity={0.4}
              stroke="#16a34a"
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}

          {!readOnly && tool === "polygon" && polyPoints.length > 0 && (
            <Group>
              <Line points={polyPoints} stroke="#22c55e" strokeWidth={2} />
              {mousePos && polyPoints.length >= 2 && (
                <Line
                  points={[...polyPoints.slice(-2), mousePos.x, mousePos.y]}
                  stroke="#22c55e"
                  strokeWidth={1}
                  dash={[5, 5]}
                />
              )}
              {polyPoints.map(
                (_, i) =>
                  i % 2 === 0 && (
                    <Circle
                      key={i}
                      x={polyPoints[i]}
                      y={polyPoints[i + 1]}
                      radius={4}
                      fill="#15803d"
                    />
                  )
              )}
            </Group>
          )}
        </Layer>
      </Stage>

      {/* HOVER TOOLTIP - Rendered via Portal to prevent clipping */}
      {hoveredRoom &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none bg-white/95 backdrop-blur-sm dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg p-3 w-56 transition-opacity duration-150 animate-in fade-in zoom-in-95"
            style={{
              left: Math.min(hoveredRoom.x + 20, window.innerWidth - 240),
              top: Math.min(hoveredRoom.y + 20, window.innerHeight - 200),
            }}
          >
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-sm text-foreground">
                {hoveredRoom.data.name}
              </h4>
              {hoveredRoom.data.is_active === false && (
                <Ban className="h-4 w-4 text-red-500" />
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <Users className="h-3 w-3" />
              <span>Capacity: {hoveredRoom.data.capacity || "?"}</span>
              <span className="mx-1">•</span>
              <span className="capitalize">
                {hoveredRoom.data.type?.replace("_", " ") || "Space"}
              </span>
            </div>

            {/* Amenities Grid */}
            {hoveredRoom.data.amenities &&
              hoveredRoom.data.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-dashed">
                  {hoveredRoom.data.amenities.map((a) => (
                    <div
                      key={a}
                      className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md text-slate-600 dark:text-slate-400 flex items-center justify-center"
                      title={a}
                    >
                      {renderAmenityIcon(a) || (
                        <span className="text-[10px] uppercase font-bold px-1">
                          {a.substring(0, 2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

            {/* Status Badge */}
            <div className="mt-3 text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
              {occupiedIds.includes(hoveredRoom.data.id) ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-red-600">Occupied</span>
                </>
              ) : hoveredRoom.data.is_active === false ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                  <span className="text-slate-500">Maintenance</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-green-600">Available</span>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default GridCanvas;
