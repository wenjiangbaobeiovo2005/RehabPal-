import { calculateAngle, calculateDistance, Landmark } from '../angleUtils';

describe('angleUtils', () => {
  describe('calculateAngle', () => {
    it('should calculate 90 degree angle for right angle', () => {
      const a: Landmark = { x: 0, y: 0, z: 0 };
      const b: Landmark = { x: 0, y: 1, z: 0 };
      const c: Landmark = { x: 1, y: 1, z: 0 };
      expect(calculateAngle(a, b, c)).toBeCloseTo(90);
    });

    it('should calculate 180 degree angle for straight line', () => {
      const a: Landmark = { x: 0, y: 0, z: 0 };
      const b: Landmark = { x: 0, y: 1, z: 0 };
      const c: Landmark = { x: 0, y: 2, z: 0 };
      expect(calculateAngle(a, b, c)).toBeCloseTo(180);
    });

    it('should handle zero magnitude vectors', () => {
      const a: Landmark = { x: 1, y: 1, z: 0 };
      const b: Landmark = { x: 1, y: 1, z: 0 };
      const c: Landmark = { x: 2, y: 2, z: 0 };
      expect(calculateAngle(a, b, c)).toBe(0);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const a: Landmark = { x: 0, y: 0, z: 0 };
      const b: Landmark = { x: 3, y: 4, z: 0 };
      expect(calculateDistance(a, b)).toBe(5);
    });
  });
});