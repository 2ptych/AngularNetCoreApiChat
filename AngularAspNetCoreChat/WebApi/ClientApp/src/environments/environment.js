"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var port = 53100;
var baseApiUrl = "http://localhost:";
var apiUrl = baseApiUrl + port;
exports.environment = {
    production: false,
    authApiUrl: apiUrl + "/api/account/login/",
    uploadPhotoApiUrl: apiUrl + "/upload/photoupload",
    validationEmailApiUrl: apiUrl + "/api/validation/ValidationUserEmail/",
    registerApiUrl: apiUrl + "/api/account/Register",
    signalrHubUrl: "/secured",
    imagePathUrl: apiUrl + "/images/",
    nameResolverUrl: apiUrl + "/api/account/Resolver"
};
//# sourceMappingURL=environment.js.map