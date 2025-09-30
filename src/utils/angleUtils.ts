/**
 * Represents a landmark point detected by MediaPipe Pose.
 */
export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/**
 * MediaPipe Pose landmark indices
 */
export const POSE_LANDMARKS = {
  /** Nose */
  NOSE: 0,
  /** Left hip */
  LEFT_HIP: 23,
  /** Right hip */
  RIGHT_HIP: 24,
  /** Left knee */
  LEFT_KNEE: 25,
  /** Right knee */
  RIGHT_KNEE: 26,
  /** Left ankle */
  LEFT_ANKLE: 27,
  /** Right ankle */
  RIGHT_ANKLE: 28,
  /** Left shoulder */
  LEFT_SHOULDER: 11,
  /** Right shoulder */
  RIGHT_SHOULDER: 12,
  /** Left elbow */
  LEFT_ELBOW: 13,
  /** Right elbow */
  RIGHT_ELBOW: 14,
  /** Left wrist */
  LEFT_WRIST: 15,
  /** Right wrist */
  RIGHT_WRIST: 16,
  /** Left heel */
  LEFT_HEEL: 29,
  /** Right heel */
  RIGHT_HEEL: 30,
  /** Left foot index */
  LEFT_FOOT_INDEX: 31,
  /** Right foot index */
  RIGHT_FOOT_INDEX: 32
} as const;

/**
 * Calculate the angle formed by three landmarks (a-b-c), where b is the vertex.
 * 
 * @param a - The first landmark point
 * @param b - The vertex landmark point
 * @param c - The third landmark point
 * @returns The angle in degrees (0-180)
 * 
 * @example
 * // Returns 90 - angle formed by points (0,0), (0,1), (1,1)
 * const angle = calculateAngle({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, {x: 1, y: 1, z: 0});
 */
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  // Calculate vectors
  const vector1 = { x: a.x - b.x, y: a.y - b.y };
  const vector2 = { x: c.x - b.x, y: c.y - b.y };

  // Calculate dot product
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

  // Calculate magnitudes
  const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
  const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

  // Handle zero magnitude to prevent division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  // Calculate angle in radians
  let cosAngle = dotProduct / (magnitude1 * magnitude2);
  
  // Handle floating point errors that might cause cosAngle to be slightly outside [-1, 1]
  cosAngle = Math.max(-1, Math.min(1, cosAngle));
  
  const angleRad = Math.acos(cosAngle);

  // Convert to degrees
  const angleDeg = angleRad * (180 / Math.PI);

  return angleDeg;
}

/**
 * Calculate the distance between two landmarks
 * 
 * @param a - The first landmark point
 * @param b - The second landmark point
 * @returns The distance between the two points
 */
export function calculateDistance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}