const port = 53100;
const baseApiUrl = "http://localhost:";
const apiUrl = baseApiUrl + port;
export const environment = {
  production: true,
  authApiUrl: apiUrl + "/api/account/login/",
  uploadPhotoApiUrl: apiUrl + "/upload/photoupload",
  validationEmailApiUrl: apiUrl + "/api/validation/ValidationUserEmail/",
  registerApiUrl: apiUrl + "/api/account/Register",
  signalrHubUrl: "/secured",
  imagePathUrl: apiUrl + "/images/",
  nameResolverUrl: apiUrl + "/api/account/Resolver"
};
