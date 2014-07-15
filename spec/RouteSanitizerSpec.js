/*global describe, beforeEach, RouteSanitizer, it, expect*/

describe("RouteSanitizer", function () {
    "use strict";

    var sanitizer,
        points = [
            {
                "latitude": "51.498714933833",
                "longitude": "-0.16011779913771",
                "timestamp": "1326378718"
            },
            {
                "latitude": "51.498405862027",
                "longitude": "-0.16040688237893",
                "timestamp": "1326378723"
            },
            {
                "latitude": "51.498205021215",
                "longitude": "-0.16062694283829",
                "timestamp": "1326378728"
            },
            {
                "latitude": "51.498041549679",
                "longitude": "-0.16053670343517",
                "timestamp": "1326378733"
            }
        ];

    beforeEach(function () {
        sanitizer = new RouteSanitizer(points);
    });

    it("should have a default maximum deviation", function () {
        expect(sanitizer.maxDeviation).toBeGreaterThan(0);
    });

    it("should configure the maximum deviation", function () {
        sanitizer.setMaxDeviation(23);
        expect(sanitizer.maxDeviation).toBe(23);
    });

    it("should calculate the distance between two points", function () {
        var distance = sanitizer.calculateDistance(points[0], points[1]);

        // that's what this specific distance happens to be
        // accounting for minor browser differences
        expect(distance - 0.0397687075774304).toBeLessThan(0.001);
    });

    it("should calculate the average speed of the journey", function () {
        var first = points[0],
            last = points[points.length - 1],
            distance,
            elapsed,
            averageSpeed;

        distance = sanitizer.calculateDistance(first, last);
        expect(Math.abs(distance - 0.0802958396525417)).toBeLessThan(0.001);

        // extra safeguard
        elapsed = last.timestamp - first.timestamp;
        expect(elapsed).toBe(15);

        averageSpeed = sanitizer.calculateAverageSpeed();
        expect(Math.abs(averageSpeed - 0.005734831504326599)).toBeLessThan(0.001);

    });

    it("should calculate how much a point deviates", function () {
        var deviation = sanitizer.calculateDeviation(points[1], points[0]);
        expect(Math.abs(deviation - 38.69180828186862)).toBeLessThan(0.001);
    });

    it("should return empty list if no points have been added", function () {
        var mySanitizer = new RouteSanitizer([]);
        expect(mySanitizer.sanitize()).toEqual([]);
    });

    it("should return all the points if max deviation is set to 100", function () {
        sanitizer.setMaxDeviation(100);
        expect(sanitizer.sanitize()).toEqual(points);
    });

    it("should return only the first point if max deviation is set to 0", function () {
        sanitizer.setMaxDeviation(0);
        expect(sanitizer.sanitize()).toEqual([points[0]]);
    });
});