/*global console*/

/*

First the average speed of the whole journey is calculated, based
on the total distance covered - including potential erroneous points -
and then divided by the total time taken.

Then for each next point, the speed is calculated and compared to the
average. If this exceeds the configured maximum, the point is thrown
out. Then for the next point, the same procedure is applied.

A few assumptions have been made:
- input is correct in terms of format (e.g. timestamp always integer)
- first and last point are assumed to be correct
- distance function borrowed from the web, geo-calculations is a large
  subject and a wheel that should not be lightly re-invented.

*/

"use strict";

//
// Utility function, taken from
// http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
//
// Implementation of Haversine formula
//
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371, // Radius of the earth in km,
        dLat = deg2rad(lat2 - lat1),  // deg2rad below
        dLon = deg2rad(lon2 - lon1),
        a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

//
// Constructor
//
function RouteSanitizer(points) {
    this.maxDeviation = 10;
    this.points = points;
}

RouteSanitizer.prototype.setMaxDeviation = function (maxDeviation) {
    this.maxDeviation = maxDeviation;
};

RouteSanitizer.prototype.calculateDistance = function (point1, point2) {
    return getDistanceFromLatLonInKm(
        point1.latitude,
        point1.longitude,
        point2.latitude,
        point2.longitude
    );
};

//
// Get first and last points and subtract their time difference
//
RouteSanitizer.prototype.totalElapsed = function () {
    var first = this.points[0],
        last = this.points[this.points.length - 1];

    return last.timestamp - first.timestamp;
};

//
// Add up all individual distances, divide by total time
//
RouteSanitizer.prototype.calculateAverageSpeed = function () {
    var self = this,
        distance = 0,
        clonedPoints = this.points.slice(0),
        previous = clonedPoints.shift();

    clonedPoints.forEach(function (point) {
        distance += self.calculateDistance(point, previous);
        previous = point;
    });

    return distance / this.totalElapsed();
};

//
// Compare the speed of the last hop to the average, return
// as percentage. E.g. 15 compared to 10 -> deviation = 50%
//
RouteSanitizer.prototype.calculateDeviation = function (point, previousPoint) {
    var averageSpeed = this.calculateAverageSpeed(),
        distance = this.calculateDistance(point, previousPoint),
        elapsed = point.timestamp - previousPoint.timestamp,
        speed = distance / elapsed;

    // percentage
    return Math.abs((100 * speed / averageSpeed) - 100);
};

//
// filter out the points for which the deviation exceeds the
// configured maximum, comparing to the average.
//
RouteSanitizer.prototype.sanitize = function () {
    if (!this.points.length) {
        return [];
    }

    var self = this,
        clonedPoints = this.points.slice(0),
        previousPoint = clonedPoints.shift(),
        filtered;

    filtered = clonedPoints.filter(function (point) {
        var deviation = self.calculateDeviation(point, previousPoint);
        console.log('deviation:', deviation);

        if (deviation > self.maxDeviation) {
            console.log("found deviation exceeding maximum", point);
            return false;
        }

        // only regard a point if it is assumed correct
        previousPoint = point;
        point.deviation = deviation;

        return true;
    });

    return [].concat(this.points[0], filtered);
};
