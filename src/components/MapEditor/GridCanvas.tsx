import React, { useState, useRef } from "react";
import { Stage, Layer, Line, Rect, Circle, Group } from "react-konva";
import Konva from "konva";
import type { RoomShape, RectCoordinates } from "../../types/apiTypes";

interface GridCanvasProps {
  width: number;
  height: number;
  snapSize?: number;
  rectangles: RoomShape[];
  setRectangles?: React.Dispatch<React.SetStateAction<RoomShape[]>>; // Optional now (User mode doesn't need it)
  tool: "select" | "rect" | "polygon";
  readOnly?: boolean; // NEW: Disables all editing logic
  onRoomClick?: (room: RoomShape) => void;
  occupiedIds?: string[]; // NEW: List of occupied room IDs to change appearance
}

const GridCanvas: React.FC<GridCanvasProps> = ({
  width,
  height,
  snapSize = 20,
  rectangles,
  setRectangles,
  tool,
  readOnly = false, // Default to false (Editor mode)
  onRoomClick,
  occupiedIds = [],
}) => {
  const [newRect, setNewRect] = useState<RectCoordinates | null>(null);
  const [polyPoints, setPolyPoints] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );

  const getFillColor = (id: string) => {
    if (occupiedIds.includes(id)) {
      return "#ffcccc"; // Light Red (Occupied)
    }
    return "#ccffcc"; // Light Green (Free)
    // Previously we used "#aaddff" (Blue)
  };

  const getStrokeColor = (id: string) => {
    if (occupiedIds.includes(id)) {
      return "#cc0000"; // Dark Red Border
    }
    return "#009900"; // Dark Green Border
  };

  const isDrawing = useRef<boolean>(false);

  // HELPER: Snap to Grid
  const snap = (val: number): number => Math.round(val / snapSize) * snapSize;

  // --- MOUSE DOWN ---
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // SECURITY: If ReadOnly, ignore all drawing inputs
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
    // SECURITY: If ReadOnly, ignore draw movements
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
    <div
      style={{
        border: "2px solid #333",
        display: "inline-block",
        backgroundColor: "white",
      }}
    >
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

          {rectangles.map((room) => {
            const commonProps = {
              key: room.id,
              onClick: () => onRoomClick?.(room),
              onTap: () => onRoomClick?.(room),
              onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
                const stage = e.target.getStage();
                // Visual feedback: If clickable, show pointer
                if (stage) stage.container().style.cursor = "pointer";
              },
              onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "default";
              },
              fill: getFillColor(room.id), // <--- USE DYNAMIC COLOR
              stroke: getStrokeColor(room.id), // <--- USE DYNAMIC STROKE
              strokeWidth: 2,
              opacity: 0.8,
              draggable: !readOnly && tool === "select", // Disable dragging in User Mode
            };

            if (room.shapeType === "rect") {
              return (
                <Rect
                  {...commonProps}
                  x={room.data.x}
                  y={room.data.y}
                  width={room.data.width}
                  height={room.data.height}
                />
              );
            } else {
              return (
                <Line
                  {...commonProps}
                  points={room.data.points}
                  closed={true}
                />
              );
            }
          })}

          {/* HIDE GHOST SHAPES IN READ ONLY MODE */}
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
