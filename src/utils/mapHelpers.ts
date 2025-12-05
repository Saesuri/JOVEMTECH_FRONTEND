import type {
  Space,
  RoomShape,
  RectCoordinates,
  PolygonCoordinates,
} from "../types/apiTypes";

// --- Type Guards (Logic to check shape types at runtime) ---

export function isRectCoordinates(coords: unknown): coords is RectCoordinates {
  return (
    typeof coords === "object" &&
    coords !== null &&
    "width" in coords &&
    "height" in coords
  );
}

export function isPolyCoordinates(
  coords: unknown
): coords is PolygonCoordinates {
  return typeof coords === "object" && coords !== null && "points" in coords;
}

// --- Mapper (Logic to convert DB Data -> UI Data) ---

export const mapSpacesToShapes = (spaces: Space[]): RoomShape[] => {
  const loadedShapes: RoomShape[] = [];

  spaces.forEach((space) => {
    // Check if it's a Rectangle
    if (isRectCoordinates(space.coordinates)) {
      loadedShapes.push({
        id: space.id,
        name: space.name,
        shapeType: "rect",
        data: space.coordinates,
      });
    }
    // Check if it's a Polygon
    else if (isPolyCoordinates(space.coordinates)) {
      loadedShapes.push({
        id: space.id,
        name: space.name,
        shapeType: "polygon",
        data: space.coordinates,
      });
    }
  });

  return loadedShapes;
};
