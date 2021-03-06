"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var decorators_1 = require('@angular/src/core/util/decorators');
var router_1 = require("@angular/router");
var Global_1 = require("./Global");
var http_1 = require("@angular/http");
var DynamicRouteConfigurator = (function () {
    function DynamicRouteConfigurator(registry, http) {
        this.registry = registry;
        this.http = http;
    }
    // Gets the list of registered with @RouteConfig routes
    // associated with given `component`
    DynamicRouteConfigurator.prototype.getRoutes = function (component) {
        return Reflect.getMetadata('annotations', component)
            .filter(function (a) {
            return a.constructor.name === 'RouteConfig';
        }).pop();
    };
    // Updates the metadata added by @RouteConfig associated
    // with given `component`
    DynamicRouteConfigurator.prototype.updateRouteConfig = function (component, routeConfig) {
        var annotations = Reflect.getMetadata('annotations', component);
        var routeConfigIndex = -1;
        for (var i = 0; i < annotations.length; i += 1) {
            if (annotations[i].constructor.name === 'RouteConfig') {
                routeConfigIndex = i;
                break;
            }
        }
        if (routeConfigIndex < 0) {
            //throw new Error('No route metadata attached to the component');
            annotations.push(routeConfig);
        }
        else {
            annotations[routeConfigIndex] = routeConfig;
        }
        Reflect.defineMetadata('annotations', annotations, component);
    };
    // Adds additional `route` to given `component`
    DynamicRouteConfigurator.prototype.addRoute = function (component, route) {
        var routeConfig = this.getRoutes(component);
        if (routeConfig) {
            routeConfig.configs.push(route);
        }
        else {
            routeConfig = new router_1.RouteConfig([route]);
        }
        this.updateRouteConfig(component, routeConfig);
        this.registry.config(component, route);
    };
    DynamicRouteConfigurator.prototype.loadRouteConfig = function (component, url) {
        url = url || readDynamicRouteConfigMetadata(component).url;
        return this.internalLoadRouteConfig(component, url);
    };
    DynamicRouteConfigurator.prototype.internalLoadRouteConfig = function (component, url) {
        var _this = this;
        return this.http.get(url)
            .map(function (resp) { return resp.json(); })
            .map(function (routes) {
            routes.map(function (route) {
                route.loader = loader(route.file, route.component, _this);
                _this.addRoute(component, {
                    path: route.path,
                    name: route.name,
                    loader: route.loader,
                    useAsDefault: route.useAsDefault || false
                });
            });
        })
            .toPromise();
    };
    DynamicRouteConfigurator = __decorate([
        Global_1.Global(),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [(typeof (_a = typeof router_1.RouteRegistry !== 'undefined' && router_1.RouteRegistry) === 'function' && _a) || Object, http_1.Http])
    ], DynamicRouteConfigurator);
    return DynamicRouteConfigurator;
    var _a;
}());
exports.DynamicRouteConfigurator = DynamicRouteConfigurator;
function loader(path, component, drc) {
    return function () { return System.import(path)
        .then(function (m) { return m[component]; })
        .then(function (component) {
        var meta = readDynamicRouteConfigMetadata(component);
        if (meta && meta.url) {
            return drc.internalLoadRouteConfig(component, meta.url)
                .then(function () {
                component.routes = drc.getRoutes(component).configs;
                return component;
            });
        }
        else {
            return component;
        }
    }); };
}
exports.loader = loader;
//////////////////////////////////////////
//      Annotation & Decorator         //
/////////////////////////////////////////
var DynamicRouteConfigMetadata = (function () {
    function DynamicRouteConfigMetadata(url) {
        this.url = url;
    }
    return DynamicRouteConfigMetadata;
}());
exports.DynamicRouteConfigMetadata = DynamicRouteConfigMetadata;
exports.DynamicRouteConfig = decorators_1.makeDecorator(DynamicRouteConfigMetadata);
function readDynamicRouteConfigMetadata(component) {
    return Reflect.getMetadata('annotations', component)
        .filter(function (item) { return item.constructor.name === 'DynamicRouteConfigMetadata'; })
        .pop();
}
// TODO: Write DynamicRouteConfigResolver for dynamic URL. 
//# sourceMappingURL=DynamicRouteConfigurator.js.map