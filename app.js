var myClinic = angular.module('myClinic', ['ngResource', 'ngRoute', 'simplePagination','ngAnimate', 'ngTouch']);

myClinic.config(["$routeProvider",
    function($routeProvider) {
        $routeProvider.
        when("/home", {
            templateUrl: "view/passPage.html",
            controller: "MainController"
        }).
        when("/main", {
            templateUrl: "view/main.html",
            controller: "MainController"
        }).
        when("/createForm", {
            templateUrl: "view/formCreate.html",
            controller: "FormController"
        }).
        when("/photoGallery", {
            templateUrl: "view/photoGallery.html",
            controller: "FormController"
        }).
        otherwise({
            redirectTo: "/home"
        });
    }
]);
myClinic.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});