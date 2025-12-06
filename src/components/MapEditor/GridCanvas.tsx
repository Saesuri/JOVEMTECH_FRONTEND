import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Rect, Circle, Group, Text } from "react-konva";
import Konva from "konva";
import type { RoomShape, RectCoordinates } from "../../types/apiTypes";

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
}) => {
  // Temporary State for Drawing
  const [newRect, setNewRect] = useState<RectCoordinates | null>(null);
  const [polyPoints, setPolyPoints] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );

  const isDrawing = useRef<boolean>(false);

  // --- Handle Escape Key ---
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

  // Helper: Snap to Grid
  const snap = (val: number): number => Math.round(val / snapSize) * snapSize;

  // Helper: Get Colors
  const getFillColor = (id: string) => {
    if (occupiedIds.includes(id)) return "#ffcccc"; // Red (Occupied)
    return "#ccffcc"; // Green (Free)
  };

  const getStrokeColor = (id: string) => {
    if (occupiedIds.includes(id)) return "#cc0000";
    return "#009900"; // Green Border
  };

  // --- MOUSE DOWN ---
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

  // --- MOUSE MOVE ---
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (readOnly) return;

    const stage = e.target.getStage();
    if (!stage) return;
    const { x, y } = stage.getPointerPosition() || { x: 0, y: 0 };
    const snX = snap(x);
    const snY = snap(y);

    setMousePos({ x: snX, y: snY });

    if (tool === "rect" && isDrawing.current && newRect) {
      setNewRect({
        ...newRect,
        width: snX - newRect.x,
        height: snY - newRect.y,
      });
    }
  };

  // --- MOUSE UP ---
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

  // --- FINISH POLYGON ---
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

  // --- RENDER GRID ---
  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i <= width / snapSize; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * snapSize, 0, i * snapSize, height]}
          stroke="#eee"
          strokeWidth={1}
        />
      );
    }
    for (let j = 0; j <= height / snapSize; j++) {
      lines.push(
        <Line
          key={`h-${j}`}
          points={[0, j * snapSize, width, j * snapSize]}
          stroke="#eee"
          strokeWidth={1}
        />
      );
    }
    return lines;
  };

  return (
    <div className="border border-slate-300 inline-block bg-white shadow-sm rounded overflow-hidden">
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={() => !readOnly && tool === "polygon" && finishPolygon()}
      >
        <Layer>
          {renderGrid()}

          {/* RENDER ROOMS */}
          {rectangles.map((room) => {
            const isRect = room.shapeType === "rect";
            const hasStatus = occupiedIds.length > 0 || readOnly;
            const fillColor = hasStatus ? getFillColor(room.id) : "#aaddff";
            const strokeColor = hasStatus ? getStrokeColor(room.id) : "#0066cc";

            let textX = 0;
            let textY = 0;

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
                onClick={() => onRoomClick?.(room)}
                onTap={() => onRoomClick?.(room)}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = "pointer";
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = "default";
                }}
                draggable={!readOnly && tool === "select"}
                onDragEnd={(e) => {
                  if (readOnly || !setRectangles) return;
                  const node = e.target;

                  // 1. Calculate the drag distance relative to start
                  const dragX = Math.round(node.x() / snapSize) * snapSize;
                  const dragY = Math.round(node.y() / snapSize) * snapSize;

                  // 2. Visually reset the group (so we can update the internal data instead)
                  node.position({ x: 0, y: 0 });

                  // 3. Update State safely
                  setRectangles((prev) =>
                    prev.map((r) => {
                      if (r.id !== room.id) return r;

                      // FIX: Strictly check type of 'r' inside the map to satisfy TS
                      if (r.shapeType === "rect") {
                        return {
                          ...r,
                          data: {
                            ...r.data,
                            x: r.data.x + dragX,
                            y: r.data.y + dragY,
                          },
                        };
                      }
                      // Note: Polygon dragging logic omitted for simplicity
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
                    opacity={0.8}
                  />
                ) : (
                  <Line
                    points={room.data.points}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2}
                    closed={true}
                    opacity={0.8}
                  />
                )}

                <Text
                  x={textX}
                  y={textY}
                  text={room.name}
                  fontSize={12}
                  fontFamily="Arial"
                  fontStyle="bold"
                  fill="#1e293b"
                  offsetX={room.name.length * 3}
                  offsetY={6}
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
              fill="#55cc55"
              opacity={0.5}
            />
          )}

          {!readOnly && tool === "polygon" && polyPoints.length > 0 && (
            <Group>
              <Line points={polyPoints} stroke="#55cc55" strokeWidth={2} />
              {mousePos && polyPoints.length >= 2 && (
                <Line
                  points={[...polyPoints.slice(-2), mousePos.x, mousePos.y]}
                  stroke="#55cc55"
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
                      radius={3}
                      fill="#0066cc"
                    />
                  )
              )}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default GridCanvas;
