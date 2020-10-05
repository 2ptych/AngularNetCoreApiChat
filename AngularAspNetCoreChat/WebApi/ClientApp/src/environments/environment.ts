// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
const port = 53100;
const baseApiUrl = "http://localhost:";
const apiUrl = baseApiUrl + port;
export const environment = {
  production: false,
  authApiUrl: apiUrl + "/api/account/login/",
  uploadPhotoApiUrl: apiUrl + "/upload/photoupload",
  validationEmailApiUrl: apiUrl + "/api/validation/ValidationUserEmail/",
  registerApiUrl: apiUrl + "/api/account/Register",
  signalrHubUrl: "/secured",
  imagePathUrl: apiUrl + "/images/",
  nameResolverUrl: apiUrl + "/api/account/Resolver"
};
