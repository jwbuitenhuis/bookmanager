/*global $, angular, console*/

(function () {

    "use strict";

    var app = angular.module("app", []);

    app.controller("LoginController", function ($scope) {
        $scope.myUser = '';

        // stub login: will accept credentials if they are the same
        // e.g. citi/citi
        $scope.attemptLogin = function () {
            if ($scope.username && $scope.username === $scope.password) {
                $scope.password = '';
                $scope.myUser = $scope.username;
                $scope.loginError = '';
            } else {
                $scope.loginError = 'Login failed. Hint: Try citi/citi';
            }
        };

        $scope.logout = function () {
            $scope.myUser = '';
            $scope.username = '';
        };

    });

    // central repository for book data, keep data in the closure
    app.service('bookService', function () {
        var current, books = [];

        return {
            add: function (book) {
                books.push(book);
            },
            removeAt: function (index) {
                books.splice(index, 1);
            },
            get: function () {
                return books;
            },
            setCurrent: function (book) {
                current = book;
            },
            getCurrent: function () {
                return current;
            }
        };
    });

    // manage the list of books
    app.controller("BooksController", function ($scope, bookService) {

        $scope.books = bookService.get();

        $scope.addBook = function () {
            $scope.books.push({
                title: $scope.newBookTitle,
                chapters: []
            });
            $scope.newBookTitle = '';
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

        // provide the chapter editor with the current book data
        $scope.loadBook = function (book) {
            var current = bookService.getCurrent();
            if (current) {
                current.active = false;
            }
            bookService.setCurrent(book);
            $scope.current = book;

            // talk to BookController
            $scope.$broadcast('bookLoaded');
            book.active = true;
        };
    });

    // add an delete chapters
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

    // add and delete pages from a chapter
    app.controller("ChapterController", function ($scope) {
        $scope.amount = 1;

        $scope.badAmount = function () {
            return !$scope.amount || isNaN(parseInt($scope.amount, 10));
        };

        $scope.addPage = function (chapter) {
            chapter.pages.push({});
        };

        // delete <amount> pages
        $scope.deletePages = function (chapter) {
            var i;

            for (i = 0; i < $scope.amount && chapter.pages.length > 0; i += 1) {
                chapter.pages.pop();
            }
        };
    });

}());
