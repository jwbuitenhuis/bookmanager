/*global angular, console*/

(function () {

    "use strict";

    var app = angular.module("app", []);

    app.controller("LoginController", function ($scope) {
        $scope.title = 'Books';
        $scope.myUser = 'test';

        $scope.attemptLogin = function () {
            if ($scope.username === $scope.password) {
                $scope.myUser = $scope.username;
                $scope.loginError = '';
                $scope.title = 'Books';
            } else {
                $scope.loginError = 'Failed login, try citi/citi';
            }
        };

    });

    app.service('bookService', function () {
        var current, books = [];

        return {
            add: function (book) {
                books.push(book);
            },
            removeAt: function (index) {
                books.splice(index, 1);
            },
            setCurrent: function (book) {
                current = book;
            },
            getCurrent: function () {
                return current;
            },
            get: function () {
                return books;
            }
        };
    });

    app.controller("BooksController", function ($scope, bookService) {

        $scope.books = bookService.get();

        $scope.addBook = function () {
            $scope.books.push({
                title: $scope.newBookTitle,
                chapters: []
            });
        };

        $scope.deleteBook = function (index) {
            bookService.removeAt(index);
        };

        // you can only add a book if the title is unique
        $scope.badTitle = function () {
            return !$scope.newBookTitle || $scope.books.filter(function (book) {
                return book.title === $scope.newBookTitle;
            }).length > 0;
        };

        $scope.loadBook = function (book) {
            bookService.setCurrent(book);
            $scope.current = book;
            $scope.$broadcast('bookLoaded');
        };
    });

    app.controller("BookController", function ($scope, bookService) {
        $scope.addChapter = function () {
            $scope.chapters.push({pages: []});
        };

        $scope.deleteChapter = function (index) {
            $scope.chapters.splice(index, 1);
        };

        $scope.$on('bookLoaded', function () {
            $scope.chapters = bookService.getCurrent().chapters;
        });
    });

    app.controller("ChapterController", function ($scope, bookService) {
        $scope.badAmount = function () {
            return !$scope.amount || isNaN(parseInt($scope.amount, 10));
        };

        $scope.addPage = function (chapter) {
            chapter.pages.push({});
        };

        $scope.deletePages = function (chapter) {
            var i;

            for (i = 0; i < $scope.amount && chapter.pages.length > 0; i += 1) {
                chapter.pages.pop();
            }
        };
    });

}());
